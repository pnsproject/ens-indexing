export const ABI_JSON = [
    {
        "type": "event",
        "anonymous": false,
        "name": "NewOwner",
        "inputs": [
            {
                "type": "bytes32",
                "name": "node",
                "indexed": true
            },
            {
                "type": "bytes32",
                "name": "label",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "owner",
                "indexed": false
            }
        ]
    }
]
