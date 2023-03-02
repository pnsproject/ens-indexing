export const ABI_JSON = [
    {
        "type": "constructor",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_ens"
            },
            {
                "type": "address",
                "name": "_registrar"
            },
            {
                "type": "address",
                "name": "_metadataService"
            }
        ]
    },
    {
        "type": "error",
        "name": "CannotUpgrade",
        "inputs": []
    },
    {
        "type": "error",
        "name": "IncompatibleParent",
        "inputs": []
    },
    {
        "type": "error",
        "name": "IncorrectTargetOwner",
        "inputs": [
            {
                "type": "address",
                "name": "owner"
            }
        ]
    },
    {
        "type": "error",
        "name": "IncorrectTokenType",
        "inputs": []
    },
    {
        "type": "error",
        "name": "LabelMismatch",
        "inputs": [
            {
                "type": "bytes32",
                "name": "labelHash"
            },
            {
                "type": "bytes32",
                "name": "expectedLabelhash"
            }
        ]
    },
    {
        "type": "error",
        "name": "LabelTooLong",
        "inputs": [
            {
                "type": "string",
                "name": "label"
            }
        ]
    },
    {
        "type": "error",
        "name": "LabelTooShort",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NameIsNotWrapped",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OperationProhibited",
        "inputs": [
            {
                "type": "bytes32",
                "name": "node"
            }
        ]
    },
    {
        "type": "error",
        "name": "Unauthorised",
        "inputs": [
            {
                "type": "bytes32",
                "name": "node"
            },
            {
                "type": "address",
                "name": "addr"
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "ApprovalForAll",
        "inputs": [
            {
                "type": "address",
                "name": "account",
                "indexed": true
            },
            {
                "type": "address",
                "name": "operator",
                "indexed": true
            },
            {
                "type": "bool",
                "name": "approved",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "ControllerChanged",
        "inputs": [
            {
                "type": "address",
                "name": "controller",
                "indexed": true
            },
            {
                "type": "bool",
                "name": "active",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "ExpiryExtended",
        "inputs": [
            {
                "type": "bytes32",
                "name": "node",
                "indexed": true
            },
            {
                "type": "uint64",
                "name": "expiry",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "FusesSet",
        "inputs": [
            {
                "type": "bytes32",
                "name": "node",
                "indexed": true
            },
            {
                "type": "uint32",
                "name": "fuses",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "NameUnwrapped",
        "inputs": [
            {
                "type": "bytes32",
                "name": "node",
                "indexed": true
            },
            {
                "type": "address",
                "name": "owner",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "NameWrapped",
        "inputs": [
            {
                "type": "bytes32",
                "name": "node",
                "indexed": true
            },
            {
                "type": "bytes",
                "name": "name",
                "indexed": false
            },
            {
                "type": "address",
                "name": "owner",
                "indexed": false
            },
            {
                "type": "uint32",
                "name": "fuses",
                "indexed": false
            },
            {
                "type": "uint64",
                "name": "expiry",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "type": "address",
                "name": "previousOwner",
                "indexed": true
            },
            {
                "type": "address",
                "name": "newOwner",
                "indexed": true
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "TransferBatch",
        "inputs": [
            {
                "type": "address",
                "name": "operator",
                "indexed": true
            },
            {
                "type": "address",
                "name": "from",
                "indexed": true
            },
            {
                "type": "address",
                "name": "to",
                "indexed": true
            },
            {
                "type": "uint256[]",
                "name": "ids",
                "indexed": false
            },
            {
                "type": "uint256[]",
                "name": "values",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "TransferSingle",
        "inputs": [
            {
                "type": "address",
                "name": "operator",
                "indexed": true
            },
            {
                "type": "address",
                "name": "from",
                "indexed": true
            },
            {
                "type": "address",
                "name": "to",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "id",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "value",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "URI",
        "inputs": [
            {
                "type": "string",
                "name": "value",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "id",
                "indexed": true
            }
        ]
    },
    {
        "type": "function",
        "name": "_tokens",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "type": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "name": "allFusesBurned",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "node"
            },
            {
                "type": "uint32",
                "name": "fuseMask"
            }
        ],
        "outputs": [
            {
                "type": "bool"
            }
        ]
    },
    {
        "type": "function",
        "name": "balanceOf",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "account"
            },
            {
                "type": "uint256",
                "name": "id"
            }
        ],
        "outputs": [
            {
                "type": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "name": "balanceOfBatch",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address[]",
                "name": "accounts"
            },
            {
                "type": "uint256[]",
                "name": "ids"
            }
        ],
        "outputs": [
            {
                "type": "uint256[]"
            }
        ]
    },
    {
        "type": "function",
        "name": "canModifyName",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "node"
            },
            {
                "type": "address",
                "name": "addr"
            }
        ],
        "outputs": [
            {
                "type": "bool"
            }
        ]
    },
    {
        "type": "function",
        "name": "controllers",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address"
            }
        ],
        "outputs": [
            {
                "type": "bool"
            }
        ]
    },
    {
        "type": "function",
        "name": "ens",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address"
            }
        ]
    },
    {
        "type": "function",
        "name": "extendExpiry",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "parentNode"
            },
            {
                "type": "bytes32",
                "name": "labelhash"
            },
            {
                "type": "uint64",
                "name": "expiry"
            }
        ],
        "outputs": [
            {
                "type": "uint64"
            }
        ]
    },
    {
        "type": "function",
        "name": "getData",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "id"
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": "owner"
            },
            {
                "type": "uint32",
                "name": "fuses"
            },
            {
                "type": "uint64",
                "name": "expiry"
            }
        ]
    },
    {
        "type": "function",
        "name": "isApprovedForAll",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "account"
            },
            {
                "type": "address",
                "name": "operator"
            }
        ],
        "outputs": [
            {
                "type": "bool"
            }
        ]
    },
    {
        "type": "function",
        "name": "isWrapped",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "node"
            }
        ],
        "outputs": [
            {
                "type": "bool"
            }
        ]
    },
    {
        "type": "function",
        "name": "metadataService",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address"
            }
        ]
    },
    {
        "type": "function",
        "name": "name",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "string"
            }
        ]
    },
    {
        "type": "function",
        "name": "names",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "bytes32"
            }
        ],
        "outputs": [
            {
                "type": "bytes"
            }
        ]
    },
    {
        "type": "function",
        "name": "onERC721Received",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "to"
            },
            {
                "type": "address"
            },
            {
                "type": "uint256",
                "name": "tokenId"
            },
            {
                "type": "bytes",
                "name": "data"
            }
        ],
        "outputs": [
            {
                "type": "bytes4"
            }
        ]
    },
    {
        "type": "function",
        "name": "owner",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address"
            }
        ]
    },
    {
        "type": "function",
        "name": "ownerOf",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "id"
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": "owner"
            }
        ]
    },
    {
        "type": "function",
        "name": "recoverFunds",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_token"
            },
            {
                "type": "address",
                "name": "_to"
            },
            {
                "type": "uint256",
                "name": "_amount"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "registerAndWrapETH2LD",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "string",
                "name": "label"
            },
            {
                "type": "address",
                "name": "wrappedOwner"
            },
            {
                "type": "uint256",
                "name": "duration"
            },
            {
                "type": "address",
                "name": "resolver"
            },
            {
                "type": "uint16",
                "name": "ownerControlledFuses"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": "registrarExpiry"
            }
        ]
    },
    {
        "type": "function",
        "name": "registrar",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address"
            }
        ]
    },
    {
        "type": "function",
        "name": "renew",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "tokenId"
            },
            {
                "type": "uint256",
                "name": "duration"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": "expires"
            }
        ]
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "constant": false,
        "payable": false,
        "inputs": [],
        "outputs": []
    },
    {
        "type": "function",
        "name": "safeBatchTransferFrom",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "from"
            },
            {
                "type": "address",
                "name": "to"
            },
            {
                "type": "uint256[]",
                "name": "ids"
            },
            {
                "type": "uint256[]",
                "name": "amounts"
            },
            {
                "type": "bytes",
                "name": "data"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "safeTransferFrom",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "from"
            },
            {
                "type": "address",
                "name": "to"
            },
            {
                "type": "uint256",
                "name": "id"
            },
            {
                "type": "uint256",
                "name": "amount"
            },
            {
                "type": "bytes",
                "name": "data"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setApprovalForAll",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "operator"
            },
            {
                "type": "bool",
                "name": "approved"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setChildFuses",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "parentNode"
            },
            {
                "type": "bytes32",
                "name": "labelhash"
            },
            {
                "type": "uint32",
                "name": "fuses"
            },
            {
                "type": "uint64",
                "name": "expiry"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setController",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "controller"
            },
            {
                "type": "bool",
                "name": "active"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setFuses",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "node"
            },
            {
                "type": "uint16",
                "name": "ownerControlledFuses"
            }
        ],
        "outputs": [
            {
                "type": "uint32"
            }
        ]
    },
    {
        "type": "function",
        "name": "setMetadataService",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_metadataService"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setRecord",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "node"
            },
            {
                "type": "address",
                "name": "owner"
            },
            {
                "type": "address",
                "name": "resolver"
            },
            {
                "type": "uint64",
                "name": "ttl"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setResolver",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "node"
            },
            {
                "type": "address",
                "name": "resolver"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setSubnodeOwner",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "parentNode"
            },
            {
                "type": "string",
                "name": "label"
            },
            {
                "type": "address",
                "name": "owner"
            },
            {
                "type": "uint32",
                "name": "fuses"
            },
            {
                "type": "uint64",
                "name": "expiry"
            }
        ],
        "outputs": [
            {
                "type": "bytes32",
                "name": "node"
            }
        ]
    },
    {
        "type": "function",
        "name": "setSubnodeRecord",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "parentNode"
            },
            {
                "type": "string",
                "name": "label"
            },
            {
                "type": "address",
                "name": "owner"
            },
            {
                "type": "address",
                "name": "resolver"
            },
            {
                "type": "uint64",
                "name": "ttl"
            },
            {
                "type": "uint32",
                "name": "fuses"
            },
            {
                "type": "uint64",
                "name": "expiry"
            }
        ],
        "outputs": [
            {
                "type": "bytes32",
                "name": "node"
            }
        ]
    },
    {
        "type": "function",
        "name": "setTTL",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "node"
            },
            {
                "type": "uint64",
                "name": "ttl"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "setUpgradeContract",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_upgradeAddress"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "supportsInterface",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "bytes4",
                "name": "interfaceId"
            }
        ],
        "outputs": [
            {
                "type": "bool"
            }
        ]
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "newOwner"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "unwrap",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "parentNode"
            },
            {
                "type": "bytes32",
                "name": "labelhash"
            },
            {
                "type": "address",
                "name": "controller"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "unwrapETH2LD",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "labelhash"
            },
            {
                "type": "address",
                "name": "registrant"
            },
            {
                "type": "address",
                "name": "controller"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "upgrade",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "parentNode"
            },
            {
                "type": "string",
                "name": "label"
            },
            {
                "type": "address",
                "name": "wrappedOwner"
            },
            {
                "type": "address",
                "name": "resolver"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "upgradeContract",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address"
            }
        ]
    },
    {
        "type": "function",
        "name": "upgradeETH2LD",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "string",
                "name": "label"
            },
            {
                "type": "address",
                "name": "wrappedOwner"
            },
            {
                "type": "address",
                "name": "resolver"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "uri",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "tokenId"
            }
        ],
        "outputs": [
            {
                "type": "string"
            }
        ]
    },
    {
        "type": "function",
        "name": "wrap",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "bytes",
                "name": "name"
            },
            {
                "type": "address",
                "name": "wrappedOwner"
            },
            {
                "type": "address",
                "name": "resolver"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "wrapETH2LD",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "string",
                "name": "label"
            },
            {
                "type": "address",
                "name": "wrappedOwner"
            },
            {
                "type": "uint16",
                "name": "ownerControlledFuses"
            },
            {
                "type": "address",
                "name": "resolver"
            }
        ],
        "outputs": []
    }
]
