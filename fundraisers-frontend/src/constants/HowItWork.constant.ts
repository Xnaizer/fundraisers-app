

export interface FundraisersWorkType {
    id: number;
    name: string;
    title: string;
    desc: string;
}

export const FundraisersWork = [
    {
        id: 1,
        name: "Add Program",
        title: "Admin Adds a New Campaign",
        desc: "Fundraisers begins with a new campaign created and verified by the platform’s admin. Each program includes detailed descriptions, goals, and the designated person-in-charge (PIC) to ensure credibility."
    },
    {
        id: 2,
        name: "Fund Raised",
        title: "Public Donations Begin",
        desc: "Once published, the program is open for public contributions. Supporters from anywhere can donate using blockchain-based transactions, ensuring each donation is recorded transparently."
    },
    {
        id: 3,
        name: "Fund Allocation",
        title: "Funds Assigned to Program PIC",
        desc: "After reaching certain milestones or targets, funds are allocated to the PIC responsible for executing the program. "
    },
    {
        id: 4,
        name: "Fund Withdrawal",
        title: "PIC Withdraws Funds for Implementation",
        desc: "The PIC can withdraw allocated funds according to the agreed plan. Every withdrawal is logged on-chain with details about usage to ensure responsible handling."
    },
    {
        id: 5,
        name: "Fund Monitoring",
        title: "Public Can Monitor Fund Flow",
        desc: "All donation and spending activities are recorded and accessible to the public in real-time. This allows anyone to monitor how funds are used and ensure they align with the program's goals."
    },
    {
        id: 6,
        name: "Real-Time Accountability",
        title: "Transparent and Traceable Transactions",
        desc: "Every financial activity—from donations to withdrawals—is verifiable on the blockchain. This fosters trust and holds all involved parties accountable without relying on centralized control."
    }
]