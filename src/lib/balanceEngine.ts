export function calculateNetBalances(members: any[], expenses: any[]) {
    const balances: Record<string, number> = {}

    members.forEach(m => balances[m.id] = 0)

    expenses.forEach(exp => {
        // Payer is "owed" the amount they paid
        balances[exp.payerId] += exp.amount

        // Each split is "owed by" the participant
        exp.splits.forEach((split: any) => {
            balances[split.memberId] -= split.amount
        })
    })

    return balances
}

export function simplifyDebts(balances: Record<string, number>) {
    const transactions: { from: string, to: string, amount: number }[] = []

    const debtors = Object.entries(balances)
        .filter(([_, amount]) => amount < -0.01)
        .sort((a, b) => a[1] - b[1]) // Most negative first

    const creditors = Object.entries(balances)
        .filter(([_, amount]) => amount > 0.01)
        .sort((a, b) => b[1] - a[1]) // Most positive first

    let d = 0
    let c = 0

    while (d < debtors.length && c < creditors.length) {
        const debtor = debtors[d]
        const creditor = creditors[c]

        const amount = Math.min(Math.abs(debtor[1]), creditor[1])

        if (amount > 0.01) {
            transactions.push({
                from: debtor[0],
                to: creditor[0],
                amount: parseFloat(amount.toFixed(2))
            })
        }

        debtors[d][1] += amount
        creditors[c][1] -= amount

        if (Math.abs(debtors[d][1]) < 0.01) d++
        if (Math.abs(creditors[c][1]) < 0.01) c++
    }

    return transactions
}
