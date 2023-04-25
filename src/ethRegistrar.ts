import { EvmBlock, EvmLog } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import {
  checkValidLabel,
  createOrLoadAccount,
  createOrLoadRegistration,
  nameByHash,
} from "./utils";
import * as registrar from "./abi/BaseRegistrar";
import * as controllerOld from "./abi/EthRegistrarControllerOld";
import * as controller from "./abi/EthRegistrarController";
import { Logger } from "@subsquid/logger";

import { keccak256, namehash, concat, hexlify } from "ethers/lib/utils";
import { Domain, Registration } from "./model";
import { getDomain } from "./ensRegistry";

var rootNode: string = "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae";

export async function handleNameRegistered(
  log: Logger,
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  let event = registrar.events.NameRegistered.decode(raw_event);
  let owner = await createOrLoadAccount(store, event.owner);

  let label = event.id.toBigInt().toString(16);
  let domainId = hexlify(keccak256(concat([rootNode, label])));
  log.info(`handle name registered ${domainId} ${event.id}`);
  let domain = await getDomain(store, domainId);
  if (domain) {
    let registration = await createOrLoadRegistration(
      store,
      label.toString(),
      domain,
      BigInt(block.timestamp),
      event.expires.toBigInt(),
      owner
    );

    registration.domain = domain;
    registration.registrationDate = BigInt(block.timestamp);
    registration.expiryDate = event.expires.toBigInt();
    registration.registrant = owner;

    let labelHash = label.toString();
    let labelName = await nameByHash(log, store, labelHash);
    if (labelName) {
      domain.labelName = labelName;
      domain.name = labelName + ".eth";
      registration.labelName = labelName;
    }

    if (domain.parent == null && domain.name != null) {
      domain.parent = await store.get(Domain, "0x2cce564b191058ca62a839a90fe8bce598992c18b4f37fc64c2ce988f45bf5ef");
    }
    domain.labelhash = labelHash;
    await store.upsert(domain);
    await store.upsert(registration);
  }
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

  if (!checkValidLabel(name)) {
    return;
  }

  let domainId;
  try {
    domainId = namehash(name + '.eth');
    log.info(`set domain id: ${domainId}`);
  } catch (error) {
    log.error(`Error in namehash function: ${error}`);
    return;
  }

  let domain = await getDomain(
    store,
    domainId
  );

  if (domain) {
    if (domain.labelName !== name) {
      domain.labelName = name;
      domain.name = name + ".eth";
      await store.upsert(domain);
    } else {
      log.info(`label name is same: ${domain.labelName}`);
    }
  } else {
    log.info(`domain not found: ${domainId} ${name}`);
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
  let label = event.id.toBigInt().toString(16);
  let registration = await store.get(Registration, label.toString());
  if (registration) {
    registration.expiryDate = event.expires.toBigInt();
    await store.upsert(registration);
  }
}

export async function handleNameTransferred(
  store: Store,
  raw_event: EvmLog
): Promise<void> {
  let event = registrar.events.Transfer.decode(raw_event);

  let account = await createOrLoadAccount(store, event.to);

  let label = event.tokenId.toBigInt().toString(16);
  let registration = await store.get(Registration, label.toString());
  if (registration == null) return;

  registration.registrant = account;
  await store.upsert(registration);
}
