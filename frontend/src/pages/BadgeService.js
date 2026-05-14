export const BadgeInscription = {
    username: (ins) => {
        return {content:ins.username}
    },
    fullname: (ins) => {
        return {content:ins.full_name}
    },
    status: (ins) => {
        let value = ins.status
        let content = ""
        let color = 'slate'
        if (value == "ACTIVE"){
            content='en cours'
            color='green'
        } else if (value == "PROMOTED") {
            content='promus'
            color='yellow'
        } else if (value == "REPEAT"){
            content='redouble'
            color='red'
        } else {
            content='exclus'
            color='red'
        }
        return {content,color,label:'etat : '}
    },
    formation: (ins) => {
        const formation = ins.formation
        const content = typeof formation === 'object' ? formation.label || formation.name || formation.code : formation
        return {content,color:'blue'}
    },
    level: (ins) => {
        const level = ins.level
        const content = typeof level === 'object' ? level.label || level.name || level.code : level
        return {content,color:'blue'}
    },
    schoolYear: (ins) => {
        const schoolYear = ins.school_year
        const content = typeof schoolYear === 'object' ? schoolYear.label || schoolYear.name || schoolYear.code : schoolYear
        return {content,color:'blue'}
    }
}
export const BadgeYear = {
    label: (year) => {
        return {content:year.label}
    },
    status: (year) => {
        let value = year.status
        let color = 'stale'
        let content = ""
        if(value=="UPCOMING"){
            content = "à venir"
            color = 'yellow'
        }else if (value == "ACTIVE"){
            content = "active"
            color = 'green'
        }else{
            content ="clôt"
            color = 'red'
        }
        return {content,color}
    }
}

export default {BadgeInscription,BadgeYear}