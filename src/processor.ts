import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import {
  BlockHandlerContext,
  EvmBatchProcessor,
  LogHandlerContext,
} from "@subsquid/evm-processor";
import * as registrar from "./abi/BaseRegistrar";
import * as controllerOld from "./abi/EthRegistrarControllerOld";
import * as controller from "./abi/EthRegistrarController";
import * as registry from "./abi/Registry";
import * as publicResolver from "./abi/PublicResolver";

import {
  handleNewOwner,
  handleNewOwnerOldRegistry,
  handleNewResolver,
  handleNewResolverOldRegistry,
  handleNewTTL,
  handleNewTTLOldRegistry,
  handleTransfer,
  handleTransferOldRegistry,
} from "./ensRegistry";
import {
  handleAddrChanged,
  handleContentHashChanged,
  handleMulticoinAddrChanged,
  handleNameChanged,
  handlePubkeyChanged,
  handleTextChanged,
  handleTextChangedWithValue,
  handleVersionChanged,
} from "./resolver";
import {
  handleNameRegistered,
  handleNameRegisteredByController,
  handleNameRegisteredByControllerOld,
  handleNameRenewed,
  handleNameRenewedByController,
  handleNameTransferred,
} from "./ethRegistrar";
import { lookupArchive } from "@subsquid/archive-registry";

const processor = new EvmBatchProcessor()
  .setDataSource({
    chain: process.env.RPC_ENDPOINT,
    archive: lookupArchive("eth-mainnet"),
  })
  .addLog("0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", {
    filter: [
      [
        registry.events.Transfer.topic,
        registry.events.NewOwner.topic,
        registry.events.NewResolver.topic,
        registry.events.NewTTL.topic,
      ],
    ],
    data: {
      evmLog: {
        topics: true,
        data: true,
      },
      transaction: {
        hash: true,
      },
    },
    range: {
      from: 9380380,
    },
  })
  .addLog("0x314159265dd8dbb310642f98f50c066173c1259b", {
    filter: [
      [
        registry.events.Transfer.topic,
        registry.events.NewOwner.topic,
        registry.events.NewResolver.topic,
        registry.events.NewTTL.topic,
      ],
    ],
    data: {
      evmLog: {
        topics: true,
        data: true,
      },
      transaction: {
        hash: true,
      },
    },
    range: {
      from: 3327417,
    },
  })
  .addLog([], {
    filter: [
      [
        publicResolver.events.AddrChanged.topic,
        publicResolver.events.AddressChanged.topic,
        publicResolver.events.ContenthashChanged.topic,
        publicResolver.events.NameChanged.topic,
        publicResolver.events.PubkeyChanged.topic,
        publicResolver.events["TextChanged(bytes32,string,string)"].topic,
        publicResolver.events["TextChanged(bytes32,string,string,string)"]
          .topic,
        publicResolver.events.VersionChanged.topic,
      ],
    ],
    data: {
      evmLog: {
        topics: true,
        data: true,
      },
      transaction: {
        hash: true,
      },
    },
  })
  .addLog("0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85", {
    filter: [
      [
        registrar.events.NameRegistered.topic,
        registrar.events.NameRenewed.topic,
        registrar.events.Transfer.topic,
      ],
    ],
    data: {
      evmLog: {
        topics: true,
        data: true,
      },
      transaction: {
        hash: true,
      },
    },
    range: {
      from: 9380410,
    },
  })
  .addLog("0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5", {
    filter: [
      [
        controllerOld.events.NameRegistered.topic,
        controllerOld.events.NameRenewed.topic,
      ],
    ],
    data: {
      evmLog: {
        topics: true,
        data: true,
      },
      transaction: {
        hash: true,
      },
    },
    range: {
      from: 9380471,
    },
  })
  .addLog([], {
    filter: [
      [
        controller.events.NameRegistered.topic,
        controller.events.NameRenewed.topic,
      ],
    ],
    data: {
      evmLog: {
        topics: true,
        data: true,
      },
      transaction: {
        hash: true,
      },
    },
  });

processor.run(new TypeormDatabase(), async (ctx) => {
  for (let c of ctx.blocks) {
    for (let i of c.items) {
      if (i.kind === "evmLog") {
        if (i.evmLog.topics[0] === registry.events.Transfer.topic) {
          if (isOld(i.address)) {
            await handleTransferOldRegistry(ctx.log, ctx.store, i.evmLog);
          } else {
            await handleTransfer(ctx.log, ctx.store, i.evmLog);
          }
        }
        if (i.evmLog.topics[0] === registry.events.NewOwner.topic) {
          if (isOld(i.address)) {
            await handleNewOwnerOldRegistry(ctx.log, ctx.store, c.header, i.evmLog);
          } else {
            await handleNewOwner(ctx.log, ctx.store, c.header, i.evmLog);
          }
        }
        if (i.evmLog.topics[0] === registry.events.NewResolver.topic) {
          if (isOld(i.address)) {
            await handleNewResolverOldRegistry(ctx.log, ctx.store, c.header, i.evmLog);
          } else {
            await handleNewResolver(ctx.log, ctx.store, i.evmLog);
          }
        }
        if (i.evmLog.topics[0] === registry.events.NewTTL.topic) {
          if (isOld(i.address)) {
            await handleNewTTLOldRegistry(ctx.store, i.evmLog);
          } else {
            await handleNewTTL(ctx.store, i.evmLog);
          }
        }
        if (i.evmLog.topics[0] === publicResolver.events.AddrChanged.topic) {
          await handleAddrChanged(ctx.log, ctx.store, i.evmLog);
        }
        if (i.evmLog.topics[0] === publicResolver.events.AddressChanged.topic) {
          await handleMulticoinAddrChanged(ctx.log, ctx.store, i.evmLog);
        }
        if (
          i.evmLog.topics[0] === publicResolver.events.ContenthashChanged.topic
        ) {
          await handleContentHashChanged(ctx.log, ctx.store, i.evmLog);
        }
        if (i.evmLog.topics[0] === publicResolver.events.NameChanged.topic) {
          await handleNameChanged(ctx.log, ctx.store, i.evmLog);
        }
        if (i.evmLog.topics[0] === publicResolver.events.PubkeyChanged.topic) {
          await handlePubkeyChanged(ctx.log, ctx.store, i.evmLog);
        }
        if (i.evmLog.topics[0] === publicResolver.events.VersionChanged.topic) {
          await handleVersionChanged(ctx.log, ctx.store, i.evmLog);
        }
        if (
          i.evmLog.topics[0] ===
          publicResolver.events["TextChanged(bytes32,string,string)"].topic
        ) {
          await handleTextChanged(
            ctx.log,
            ctx.store,
            c.header,
            i.evmLog,
            i.transaction.hash
          );
        }
        if (
          i.evmLog.topics[0] ===
          publicResolver.events["TextChanged(bytes32,string,string,string)"]
            .topic
        ) {
          await handleTextChangedWithValue(
            ctx.log,
            ctx.store,
            c.header,
            i.evmLog,
            i.transaction.hash
          );
        }
        if (i.evmLog.topics[0] === registrar.events.NameRegistered.topic) {
          await handleNameRegistered(ctx.log, ctx.store, c.header, i.evmLog);
        }
        if (i.evmLog.topics[0] === registrar.events.NameRenewed.topic) {
          await handleNameRenewed(ctx.store, i.evmLog);
        }
        if (i.evmLog.topics[0] === registrar.events.Transfer.topic) {
          await handleNameTransferred(ctx.store, i.evmLog);
        }
        if (i.evmLog.topics[0] === controllerOld.events.NameRegistered.topic) {
          await handleNameRegisteredByControllerOld(ctx.log, ctx.store, i.evmLog);
        }
        if (i.evmLog.topics[0] === controllerOld.events.NameRenewed.topic) {
          await handleNameRenewedByController(ctx.log, ctx.store, i.evmLog);
        }
        if (i.evmLog.topics[0] === controller.events.NameRegistered.topic) {
          await handleNameRegisteredByController(ctx.log, ctx.store, i.evmLog);
        }
        if (i.evmLog.topics[0] === controller.events.NameRenewed.topic) {
          await handleNameRenewedByController(ctx.log, ctx.store, i.evmLog);
        }
      }
    }
  }
});

function isOld(address: string): boolean {
  return address === "0x314159265dd8dbb310642f98f50c066173c1259b";
}
