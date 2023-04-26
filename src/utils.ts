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
      cost: null,
      labelName: null,
    });
    await store.insert(registration);
  }

  return registration;
}

export async function nameByHash(
  log: Logger,
  store: Store,
  hash: string
): Promise<string | null> {
  let ensName = await store.findOne(ensNames, { where: { hash: hash } });
  if (ensName == null) {
    log.info(`No name found for hash ${hash}`);
    return null;
  }
  //log.info(`Name found for hash ${hash}: ${ensName.name}`);
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
  const domain = new Domain({
    id: props.id || '',
    name: props.name || null,
    labelName: props.labelName || null,
    labelhash: props.labelhash || null,
    parent: props.parent || null,
    subdomains: props.subdomains || [],
    subdomainCount: props.subdomainCount || 0,
    resolvedAddress: props.resolvedAddress || null,
    owner: props.owner || new Account(),
    resolver: props.resolver || null,
    ttl: props.ttl || null,
    isMigrated: props.isMigrated || false,
    createdAt: props.createdAt || BigInt(0),
  });

  return domain;
}