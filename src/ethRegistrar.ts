import { EvmBlock, EvmLog } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import {
  createOrLoadAccount,
  createOrLoadRegistration,
  nameByHash,
} from "./utils";
import * as registrar from "./abi/BaseRegistrar";
import * as controllerOld from "./abi/EthRegistrarControllerOld";
import * as controller from "./abi/EthRegistrarController";
import { Logger } from "@subsquid/logger";

import { keccak256, namehash, concat, hexlify, isValidName } from "ethers/lib/utils";
import { Account, Domain, Registration } from "./model";
import { getDomain } from "./ensRegistry";
import { BigNumber } from "ethers";
import { EntityManager } from "typeorm";

var rootNode: string = "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae";

export async function handleNameRegistered(
  log: Logger,
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  let event = registrar.events.NameRegistered.decode(raw_event);

  let account = await createOrLoadAccount(store, event.owner);

  let label = hexlify(event.id.toBigInt());

  let domainId = hexlify(keccak256(concat([rootNode, label])));
  log.info(`handle name registered ${domainId} ${event.id}`);
  let domain = await getDomain(store, domainId);
  if (domain == null) {
    log.error(`handleNameRegistered domain not found: ${domainId}`);
    return;
  }
  let registration = await createOrLoadRegistration(store, label, domain, BigInt(block.timestamp), event.expires.toBigInt(), account);
  registration.domain = domain;
  registration.registrationDate = BigInt(block.timestamp);
  registration.expiryDate = event.expires.toBigInt();
  registration.registrant = account;

  let labelName = await nameByHash(log, store, label);
  if (labelName != null) {
    domain.labelName = labelName;
    domain.name = labelName! + ".eth";
    registration.labelName = labelName;
  }
  store.upsert(domain);
  store.upsert(registration);
}

export async function handleNameRegisteredByControllerOld(
  log: Logger,

  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = controllerOld.events.NameRegistered.decode(raw_event);
  await setNamePreimage(log, store, event.name, event.label, event.cost.toBigInt());
}

export async function handleNameRegisteredByController(
  log: Logger,

  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = controller.events.NameRegistered.decode(raw_event);
  await setNamePreimage(
    log,
    store,
    event.name,
    event.label,
    event.baseCost.add(event.premium).toBigInt()
  );
}

export async function handleNameRenewedByController(
  log: Logger,

  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = controller.events.NameRenewed.decode(raw_event);

  await setNamePreimage(log, store, event.name, event.label, event.cost.toBigInt());
}

async function setNamePreimage(
  log: Logger,
  store: Store,
  name: string,
  label: string,
  cost: bigint
): Promise<void> {
  log.info(`set name preimage: ${name} ${label}`);

  if (!isValidName(name)) {
    log.error(`invalid name: ${name}`);
    return;
  }

  let domain = await store.get(Domain, hexlify(keccak256(concat([rootNode, label]))));

  if (domain == null) {
    log.error(`setNamePreimage domain not found: ${label}`);
    return;
  }
  if (domain.labelName !== name) {
    domain.labelName = name;
    domain.name = name + ".eth";
    await store.upsert(domain);
  }

  let registration = await store.get(Registration, label);
  if (registration == null) return;
  registration.labelName = name;
  registration.cost = cost;
  await store.upsert(registration);
}

export async function handleNameRenewed(
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = registrar.events.NameRenewed.decode(raw_event);
  let label = hexlify(event.id.toBigInt());
  let registration = await store.get(Registration, label);
  if (registration) {
    registration.expiryDate = event.expires.toBigInt();
    await store.upsert(registration);
  }
}

async function processTransferredEvent(
  log: Logger,
  store: Store,
  event: [from: string, to: string, tokenId: BigNumber] & {
    from: string;
    to: string;
    tokenId: BigNumber;
  },
  account: Account,
  label: string,
): Promise<void> {
  let registration = await store.get(Registration, label);
  if (registration == null) return;
  if (registration.domain == null) {
    log.error(`processTransferredEvent failed: domain not found: ${label}`);
    let em = await (store as unknown as { em: () => Promise<EntityManager> }).em();
    await em.queryRunner?.commitTransaction();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await processTransferredEvent(log, store, event, account, label);
  }
  registration.registrant = account;
  await store.upsert(registration);
}

export async function handleNameTransferred(
  log: Logger,
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = registrar.events.Transfer.decode(raw_event);

  let account = await createOrLoadAccount(store, event.to);

  let label = hexlify(event.tokenId.toBigInt());

  await processTransferredEvent(log, store, event, account, label);
}