import { Bitcoin } from './bitcoin'

export * from './common/index'
export * from './bitcoin'
export * from './index'


export function BitcoinValidateTxProof(proof: string): bool {
    return Bitcoin.validateTxProof(proof)
}

export function BitcoinValidateTxProofWrapper(proof: Bitcoin.FullProof): bool {
    return Bitcoin.validateTxProofWrapper(proof)
}