import { EvmBlock, EvmLog } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { Domain, Resolver } from "./model";
import * as registry from "./abi/Registry";
import * as fixedRegistry from "./abi/FixedRegistry";
import { Logger } from "@subsquid/logger";

import {
  createOrLoadAccount,
  ROOT_NODE,
  concat,
  byteArrayFromHex,
  nameByHash,
} from "./utils";
import { keccak256 } from "ethers/lib/utils";
import { LogEvent } from "./abi/abi.support";


export async function getDomain(
  store: Store,
  node: string,
  timestamp: bigint = BigInt(0)
): Promise<Domain | undefined> {
  let domain = await store.get(Domain, node);
  if (domain == null && node == ROOT_NODE) {
    let domain = new Domain({
      id: node,
      createdAt: timestamp,
      subdomainCount: 0,
      isMigrated: true,
    });
    await store.insert(domain);
    return domain;
  }
  return domain;
}

function makeSubnode(node: string, label: string): string {
  return keccak256(concat(byteArrayFromHex(node), byteArrayFromHex(label)));
}
// Handler for NewOwner events
async function _handleNewOwner(
  store: Store,
  block: EvmBlock,
  node: string,
  label: string,
  owner: string,
  isMigrated: boolean
): Promise<void> {
  let account = await createOrLoadAccount(store, owner);

  let subnode = makeSubnode(node, label);
  let parent = await getDomain(store, node);

  let domain = await getDomain(store, subnode, BigInt(block.timestamp));

  if (domain == null) {
    domain = new Domain({
      id: subnode,
      createdAt: BigInt(block.timestamp),
      subdomainCount: 0,
      isMigrated,
    });

    await store.insert(domain);
  }

  if (domain.parent == null && parent != null) {
    parent.subdomainCount = parent.subdomainCount + 1;
    await store.upsert(parent);
  }

  if (domain.name == null) {
    // Get label and node names
    let real_label = await nameByHash(store, label);
    if (real_label != null) {
      domain.labelName = label;
    } else {
      real_label = "[" + label.slice(2) + "]";
    }

    if (
      node ==
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      domain.name = real_label;
    } else {
      if (parent) {
        let name = parent.name;
        if (name) {
          domain.name = real_label + "." + name;
        }
      }
    }
  }

  domain.owner = account;
  domain.parent = parent;
  domain.labelhash = label;
  domain.isMigrated = isMigrated;
  await store.upsert(domain);
}

export async function handleTransfer(
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = registry.events.Transfer.decode(raw_event);
  let node = event.node;

  let account = await createOrLoadAccount(store, event.owner);

  // Update the domain owner
  let domain = (await getDomain(store, node))!;

  domain.owner = account;
  await store.upsert(domain);
}

// Handler for NewResolver events
export async function handleNewResolver(
  log: Logger,
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = registry.events.NewResolver.decode(raw_event);

  let id = event.resolver.concat("-").concat(event.node);

  let node = event.node;
  let domain = (await getDomain(store, node))!;

  let resolver = await store.get(Resolver, id);
  if (resolver == null) {
    resolver = new Resolver({ id });
    resolver.domain = domain;
    resolver.address = event.resolver;
    await store.insert(resolver);
  } else {
    domain.resolvedAddress = resolver.addr;
  }
  log.info(`handleNewResolver: ${resolver}`);
  domain.resolver = resolver;
  await store.upsert(domain);
}

// Handler for NewTTL events
export async function handleNewTTL(
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = registry.events.NewTTL.decode(raw_event);
  let node = event.node;
  let domain = await getDomain(store, node);
  // For the edge case that a domain's owner and resolver are set to empty
  // in the same transaction as setting TTL
  if (domain) {
    domain.ttl = event.ttl.toBigInt();
    await store.upsert(domain);
  }
}

export async function handleNewOwner(
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  if (raw_event.topics[0] != fixedRegistry.events.NewOwner.topic) {
    raw_event.topics[0] = fixedRegistry.events.NewOwner.topic
  }
  let event = fixedRegistry.events.NewOwner.decode(raw_event);

  await _handleNewOwner(
    store,
    block,
    event.node,
    event.label,
    event.owner._hex,
    true
  );
}


export async function handleNewOwnerOldRegistry(
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  if (raw_event.topics[0] != fixedRegistry.events.NewOwner.topic) {
    raw_event.topics[0] = fixedRegistry.events.NewOwner.topic
  }

  let event = fixedRegistry.events.NewOwner.decode(raw_event);

  let subnode = makeSubnode(event.node, event.label);
  let domain = await getDomain(store, subnode);

  if (domain == null) {
    await _handleNewOwner(
      store,
      block,
      event.node,
      event.label,
      event.owner._hex,
      false
    );
  } else {
    if (domain.isMigrated == false) {
      await _handleNewOwner(
        store,
        block,
        event.node,
        event.label,
        event.owner._hex,
        false
      );
    }
  }
}

export async function handleNewResolverOldRegistry(
  log: Logger,
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  let event = registry.events.NewResolver.decode(raw_event);
  let node = event.node;
  let domain = await getDomain(store, node, BigInt(block.timestamp));
  if (domain) {
    if (node == ROOT_NODE || domain.isMigrated == false) {
      await handleNewResolver(log, store, raw_event);
    }
  }
}
export async function handleNewTTLOldRegistry(
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = registry.events.NewTTL.decode(raw_event);
  let domain = await getDomain(store, event.node);
  if (domain) {
    if (domain.isMigrated == false) {
      await handleNewTTL(store, raw_event);
    }
  }
}

export async function handleTransferOldRegistry(
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = registry.events.Transfer.decode(raw_event);
  let domain = await getDomain(store, event.node);
  if (domain) {
    if (domain.isMigrated == false) {
      await handleTransfer(store, raw_event);
    }
  }
}

