import { EvmBlock, EvmLog } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { Domain, Resolver } from "./model";
import * as registry from "./abi/Registry";
import {
  createOrLoadAccount,
  createOrLoadDomain,
  EMPTY_ADDRESS,
  ROOT_NODE,
  concat,
  byteArrayFromHex,
} from "./utils";
import { keccak256 } from "ethers/lib/utils";

async function createDomain(
  store: Store,
  node: string,
  timestamp: bigint
): Promise<Domain> {
  let domain = new Domain({ id: node });
  if (node == ROOT_NODE) {
    domain = new Domain({ id: node });
    domain.owner = await createOrLoadAccount(store, EMPTY_ADDRESS);
    domain.isMigrated = true;
    domain.createdAt = timestamp;
    domain.subdomainCount = 0;
  }
  return domain;
}

export async function getDomain(
  store: Store,
  node: string,
  timestamp: bigint = BigInt(0)
): Promise<Domain | undefined> {
  let domain = await store.get(Domain, node);
  if (domain == null && node == ROOT_NODE) {
    return await createDomain(store, node, timestamp);
  } else {
    return domain;
  }
}

function makeSubnode(node: string, label: string): string {
  return keccak256(concat(byteArrayFromHex(node), byteArrayFromHex(label)));
}
// Handler for NewOwner events
async function _handleNewOwner(
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog,
  isMigrated: boolean
): Promise<void> {
  let event = registry.events.NewOwner.decode(raw_event);
  let account = await createOrLoadAccount(store, event.owner);

  let subnode = makeSubnode(event.node, event.label);
  let domain = await getDomain(store, subnode, BigInt(block.timestamp));
  let parent = await getDomain(store, event.node);

  if (domain == null) {
    domain = new Domain({ id: subnode });
    domain.createdAt = BigInt(block.timestamp);
    domain.subdomainCount = 0;
    store.insert(domain);
  }

  if (domain.parent == null && parent != null) {
    parent.subdomainCount = parent.subdomainCount + 1;
    await store.insert(parent);
  }

  if (domain.name == null) {
    // Get label and node names
    let label = keccak256(new TextEncoder().encode(event.label));
    if (label != null) {
      domain.labelName = label;
    }

    if (label == null) {
      label = "[" + event.label.slice(2) + "]";
    }
    if (
      event.node ==
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      domain.name = label;
    } else {
      if (parent) {
        let name = parent.name;
        if (label && name) {
          domain.name = label + "." + name;
        }
      }
    }
  }

  domain.owner = account;
  domain.parent = parent;
  domain.labelhash = event.label;
  domain.isMigrated = isMigrated;
  store.upsert(domain);
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
  store.upsert(domain);
}

// Handler for NewResolver events
export async function handleNewResolver(
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
    store.insert(resolver);
  } else {
    domain.resolvedAddress = resolver.addr;
  }
  domain.resolver = resolver!;
  store.upsert(domain);
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
    store.upsert(domain);
  }
}

export async function handleNewOwner(
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  await _handleNewOwner(store, block, raw_event, true);
}

export async function handleNewOwnerOldRegistry(
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  let event = registry.events.NewOwner.decode(raw_event);

  let subnode = makeSubnode(event.node, event.label);
  let domain = await getDomain(store, subnode);

  if (domain == null || domain.isMigrated == false) {
    _handleNewOwner(store, block, raw_event, false);
  }
}

export async function handleNewResolverOldRegistry(
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  let event = registry.events.NewResolver.decode(raw_event);
  let node = event.node;
  let domain = (await getDomain(store, node, BigInt(block.timestamp)))!;
  if (node == ROOT_NODE || !domain.isMigrated) {
    await handleNewResolver(store, raw_event);
  }
}
export async function handleNewTTLOldRegistry(
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  let event = registry.events.NewTTL.decode(raw_event);
  let domain = (await getDomain(store, event.node))!;
  if (domain.isMigrated == false) {
    await handleNewTTL(store, raw_event);
  }
}

export async function handleTransferOldRegistry(
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  let event = registry.events.Transfer.decode(raw_event);
  let domain = (await getDomain(store, event.node))!;
  if (domain.isMigrated == false) {
    handleTransfer(store, raw_event);
  }
}
