import { EvmBlock, EvmLog } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import {
  byteArrayFromHex,
  checkValidLabel,
  concat,
  createOrLoadAccount,
  createOrLoadRegistration,
  nameByHash,
  uint256ToByteArray,
} from "./utils";
import * as registrar from "./abi/BaseRegistrar";
import * as controllerOld from "./abi/EthRegistrarControllerOld";
import * as controller from "./abi/EthRegistrarController";
import { Logger } from "@subsquid/logger";

import { keccak256 } from "ethers/lib/utils";
import { Domain, Registration } from "./model";
import { getDomain } from "./ensRegistry";

var rootNode: Uint8Array = byteArrayFromHex(
  "93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae"
);

export async function handleNameRegistered(
  log: Logger,
  store: Store,
  block: EvmBlock,
  raw_event: EvmLog
): Promise<void> {
  let event = registrar.events.NameRegistered.decode(raw_event);
  let owner = await createOrLoadAccount(store, event.owner);

  let label = uint256ToByteArray(event.id.toBigInt());
  let domainId = keccak256(concat(rootNode, label));
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
    let labelName = await nameByHash(store, labelHash);
    if (labelName != null) {
      domain.labelName = labelName;
      domain.name = labelName + ".eth";
      registration.labelName = labelName;
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

  let domainId = keccak256(concat(rootNode, byteArrayFromHex(label)));
  log.info(`set domain id: ${domainId}`);

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
  let label = uint256ToByteArray(event.id.toBigInt());
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

  let label = uint256ToByteArray(event.tokenId.toBigInt());
  let registration = await store.get(Registration, label.toString());
  if (registration == null) return;

  registration.registrant = account;
  await store.upsert(registration);
}
