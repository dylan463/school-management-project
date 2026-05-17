export const BadgeInscription = {
    username: (ins) => {
        return { content: ins.username }
    },
    fullname: (ins) => {
        return { content: ins.full_name }
    },
    status: (ins) => {
        const status = ins.status
        let content = status == "ACTIVE" ? "non délibéré" : status == "PROMOTED" ? "promus" : status == "REPEAT" ? "redouble" : "exclus"
        let color = status == "ACTIVE" ? "yellow" : status == "PROMOTED" ? "green" : "red"
        return { content, color }
    },
    formation: (ins) => {
        const formation = ins.formation
        const content = typeof formation === 'object' ? formation.label || formation.name || formation.code : formation
        return { content, color: 'blue' }
    },
    level: (ins) => {
        const level = ins.level
        const content = typeof level === 'object' ? level.label || level.name || level.code : level
        return { content, color: 'blue' }
    },
    schoolYear: (ins) => {
        const schoolYear = ins.school_year
        const content = typeof schoolYear === 'object' ? schoolYear.label || schoolYear.name || schoolYear.code : schoolYear
        return { content, color: 'blue' }
    },
    finalYear: (ins) => {
        const finalYear = ins.final_year
        const content = finalYear ? "dernière année" : ""
        return { content, color: "green" }
    }
}
export const BadgeYear = {
    label: (year) => {
        return { content: year.label }
    },
    status: (year) => {
        let value = year.status
        let color = 'stale'
        let content = ""
        if (value == "UPCOMING") {
            content = "à venir"
            color = 'yellow'
        } else if (value == "ACTIVE") {
            content = "active"
            color = 'green'
        } else {
            content = "clôt"
            color = 'red'
        }
        return { content, color }
    }
}
export const BadgeUser = {
    fullname: (user) => {
        return { content: user.full_name }
    },
    username: (user) => {
        return { content: user.username }
    },
    email: (user) => {
        return { content: user.email }
    }
}