import { EvmBlock, EvmLog } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { Resolver, TextChanged } from "./model";
import {
  createEventID,
  createOrLoadAccount,
  createOrLoadDomain,
  insertOrUpsert,
  tryDecode,
} from "./utils";
import * as publicResolver from "./abi/PublicResolver";
import { getDomain } from "./ensRegistry";
import { Logger } from "@subsquid/logger";


export async function handleAddrChanged(
  log: Logger,
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = tryDecode(log, publicResolver.events.AddrChanged, raw_event);
  if (event == null) return;

  let account = await createOrLoadAccount(store, event.a);

  let resolver = await getOrCreateResolver(
    store,
    event.node,
    raw_event.address
  );
  resolver.domain = await getDomain(store, event.node);
  resolver.address = raw_event.address;
  resolver.addr = account;
  await store.upsert(resolver);

  let domain = await getDomain(store, event.node);
  if (domain && domain.resolver == resolver) {
    domain.resolvedAddress = account;
    await store.upsert(domain);
  }
}

export async function handleMulticoinAddrChanged(
  log: Logger,
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = tryDecode(log, publicResolver.events.AddressChanged, raw_event);
  if (event == null) return;
  await getOrCreateResolver(store, event.node, raw_event.address);
}

export async function handleNameChanged(
  log: Logger,
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = tryDecode(log, publicResolver.events.NameChanged, raw_event);
  if (event == null) return;
  if (event.name.indexOf("\u0000") != -1) return;
  let resolver = await getOrCreateResolver(
    store,
    event.node,
    raw_event.address
  );
  resolver.name = event.name;
  await store.upsert(resolver);
}

export async function handlePubkeyChanged(
  log: Logger,
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = tryDecode(log, publicResolver.events.PubkeyChanged, raw_event);
  if (event == null) return;
  let resolver = await getOrCreateResolver(
    store,
    event.node,
    raw_event.address
  );
  resolver.x = event.x;
  resolver.y = event.y;
  store.upsert(resolver);
}

export async function handleTextChanged(
  log: Logger,
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog,
  transactionHash: string
): Promise<void> {
  let event =
    tryDecode(log, publicResolver.events["TextChanged(bytes32,string,string)"], raw_event);

  if (event == null) {
    return;
  }

  let resolver = await getOrCreateResolver(
    store,
    event.node,
    raw_event.address
  );

  let resolverEvent = new TextChanged({ id: createEventID(block, raw_event) });
  resolverEvent.resolver = resolver;
  resolverEvent.blockNumber = block.height;
  resolverEvent.transactionID = new TextEncoder().encode(transactionHash);
  resolverEvent.key = event.key;

  await insertOrUpsert(store, TextChanged, resolverEvent);
}

export async function handleTextChangedWithValue(
  log: Logger,
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog,
  transactionHash: string
): Promise<void> {
  let event = tryDecode(log, publicResolver.events["TextChanged(bytes32,string,string,string)"], raw_event);
  if (event == null) return;
  let resolver = await getOrCreateResolver(
    store,
    event.node,
    raw_event.address
  );

  let resolverEvent = new TextChanged({ id: createEventID(block, raw_event) });
  resolverEvent.resolver = resolver;
  resolverEvent.blockNumber = block.height;
  resolverEvent.transactionID = new TextEncoder().encode(transactionHash);
  resolverEvent.key = event.key;
  resolverEvent.value = event.value;

  await insertOrUpsert(store, TextChanged, resolverEvent);
}

export async function handleContentHashChanged(
  log: Logger,
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event =
    tryDecode(log, publicResolver.events.ContenthashChanged, raw_event);

  if (event == null) {
    return;
  }
  let resolver = await getOrCreateResolver(
    store,
    event.node,
    raw_event.address
  );
  resolver.contentHash = event.hash;
  await store.upsert(resolver);
}

export async function handleVersionChanged(
  log: Logger,
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event =
    tryDecode(log, publicResolver.events.VersionChanged, raw_event);

  if (event == null) {
    return;
  }
  let domain = await getDomain(store, event.node);
  if (
    domain &&
    domain.resolver?.id === createResolverID(event.node, raw_event.address)
  ) {
    domain.resolvedAddress = null;
    await store.upsert(domain);
  }

  let resolver = await getOrCreateResolver(
    store,
    event.node,
    raw_event.address
  );
  resolver.addr = null;
  resolver.contentHash = null;
  await store.upsert(resolver);
}

async function getOrCreateResolver(
  store: Store,
  node: string,
  address: string
): Promise<Resolver> {
  let id = createResolverID(node, address);
  let resolver = await store.get(Resolver, id);
  if (resolver == null) {
    resolver = new Resolver({ id });
    resolver.domain = await getDomain(store, node);
    resolver.address = address;
    await store.insert(resolver);
  }
  return resolver;
}

function createResolverID(node: string, resolver: string): string {
  return resolver.concat("-").concat(node);
}
