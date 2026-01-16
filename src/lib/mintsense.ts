export function parseExpenseString(input: string, members: any[]) {
    // Pattern: [Amount] [Description] [Participants]
    // Example: "50 lunch with @Alice and @Bob"

    const amountMatch = input.match(/\d+(\.\d+)?/)
    const amount = amountMatch ? parseFloat(amountMatch[0]) : 0

    // Description is usually what's after the amount until "with" or "@"
    let description = 'Unknown'
    const descMatch = input.replace(amountMatch ? amountMatch[0] : '', '').split(/with|@|for/i)
    if (descMatch.length > 0) {
        description = descMatch[0].trim() || descMatch[1]?.trim() || 'Expense'
    }

    // Find mentioned members
    const mentioned = members.filter(m =>
        input.toLowerCase().includes(m.name.toLowerCase()) ||
        input.toLowerCase().includes(`@${m.name.toLowerCase()}`)
    )

    return {
        amount,
        description,
        mentionedIds: mentioned.map(m => m.id),
    }
}
