export const SOVEREIGN_FACTORY = '0x9dC4C054e53bCc4Ce0A0Ff09E890A7a8e817f304'
export const REGISTRY          = '0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F'
export const TRACKER           = '0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5'
export const RITUAL_WALLET     = '0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948'
export const GOLDEN_NODE       = '0x33930b5EbD5b883044D922571615b57732D7E69F'

export const FACTORY_ABI = [
  {
    name: 'predictHarness', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'userSalt', type: 'bytes32' }],
    outputs: [{ name: 'harness', type: 'address' }, { name: 'childSalt', type: 'bytes32' }],
  },
  {
    name: 'deployHarness', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'userSalt', type: 'bytes32' }],
    outputs: [{ name: 'harness', type: 'address' }],
  },
] as const

export const REGISTRY_ABI = [
  {
    name: 'getServicesByCapability', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'capability', type: 'uint8' }, { name: 'checkValidity', type: 'bool' }],
    outputs: [{ name: '', type: 'tuple[]', components: [
      { name: 'node', type: 'tuple', components: [
        { name: 'paymentAddress', type: 'address' },
        { name: 'teeAddress', type: 'address' },
        { name: 'teeType', type: 'uint8' },
        { name: 'publicKey', type: 'bytes' },
        { name: 'endpoint', type: 'string' },
        { name: 'certPubKeyHash', type: 'bytes32' },
        { name: 'capability', type: 'uint8' },
      ]},
      { name: 'isValid', type: 'bool' },
      { name: 'workloadId', type: 'bytes32' },
    ]}],
  },
] as const

export const RITUAL_WALLET_ABI = [
  {
    name: 'balanceOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'depositFor', type: 'function', stateMutability: 'payable',
    inputs: [{ name: 'account', type: 'address' }, { name: 'lockDuration', type: 'uint256' }],
    outputs: [],
  },
] as const
