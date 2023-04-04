// Import types and APIs from graph-ts
import { EvmBlock, EvmLog } from "@subsquid/evm-processor";
import { Entity, EntityClass, Store } from "@subsquid/typeorm-store";
import { LogEvent, LogRecord } from "./abi/abi.support";
import { Account, Domain, ensNames, Registration } from "./model";
import { Logger } from "@subsquid/logger";

export function createEventID(block: EvmBlock, raw_event: EvmLog): string {
  return block.height.toString().concat("-").concat(raw_event.index.toString());
}

export const ROOT_NODE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

// Helper for concatenating two byte arrays
export function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  // return out as ByteArray
  return out;
}

export function byteArrayFromHex(s: string): Uint8Array {
  if (s.length % 2 !== 0) {
    throw new TypeError("Hex string must have an even number of characters");
  }
  let out = new Uint8Array(s.length / 2);
  for (var i = 0; i < s.length; i += 2) {
    out[i / 2] = parseInt(s.substring(i, i + 2), 16) as number;
  }
  return out;
}

export function uint256ToByteArray(i: bigint): Uint8Array {
  let hex = i.toString(16).slice(2).padStart(64, "0");
  return byteArrayFromHex(hex);
}

export async function createOrLoadAccount(
  store: Store,
  address: string
): Promise<Account> {
  let account = await store.get(Account, address);
  if (account == null) {
    account = new Account({ id: address, domains: [] });
    await store.insert(account);
  }

  return account;
}

export async function createOrLoadDomain(
  store: Store,
  node: string,
  owner: Account,
  isMigrated: boolean,
  createdAt: bigint
): Promise<Domain> {
  let domain = await store.get(Domain, node);
  if (domain == null) {
    domain = createDomain({
      id: node,
      subdomainCount: 0,
      owner,
      isMigrated,
      createdAt,
    });
    await store.insert(domain);
  }

  return domain;
}

export async function createOrLoadRegistration(
  store: Store,
  id: string,
  domain: Domain,
  registrationDate: bigint,
  expiryDate: bigint,
  registrant: Account
): Promise<Registration> {
  let registration = await store.get(Registration, id);
  if (registration == null) {
    registration = new Registration({
      id,
      domain,
      registrant,
      registrationDate,
      expiryDate,
    });
    await store.insert(registration);
  }

  return registration;
}

export function checkValidLabel(name: string): boolean {
  for (let i = 0; i < name.length; i++) {
    let c = name.charCodeAt(i);
    if (c === 0) {
      return false;
    } else if (c === 46) {
      return false;
    }
  }

  return true;
}

export async function nameByHash(
  store: Store,
  hash: string
): Promise<string | null> {
  let ensName = await store.findOne(ensNames, { where: { hash: hash } });
  if (ensName == null) {
    return null;
  }
  return ensName.name;
}


export function tryDecode<Args>(log: Logger, event: LogEvent<Args>, rec: LogRecord): Args | null {
  try {
    return event.decode(rec);
  } catch (error) {
    log.error(`An error occurred while ${event.topic} decoding ${rec.data} ${rec.topics}: ${error}`);
    return null;
  }
}

export async function insertOrUpsert<E extends Entity>(store: Store, entityClass: EntityClass<E>, entity: E): Promise<void> {
  let e = await store.get(entityClass, entity.id);
  if (e == null) {
    await store.insert(entity);
  } else {
    await store.upsert(entity);
  }
}

export function createDomain(props: Partial<Domain> = {}): Domain {
  const domain = new Domain();

  domain.id = props.id || '';
  domain.name = props.name || null;
  domain.labelName = props.labelName || null;
  domain.labelhash = props.labelhash || null;
  domain.parent = props.parent || null;
  domain.subdomains = props.subdomains || [];
  domain.subdomainCount = props.subdomainCount || 0;
  domain.resolvedAddress = props.resolvedAddress || null;
  domain.owner = props.owner || new Account();
  domain.resolver = props.resolver || null;
  domain.ttl = props.ttl || null;
  domain.isMigrated = props.isMigrated || false;
  domain.createdAt = props.createdAt || BigInt(0);

  return domain;
}