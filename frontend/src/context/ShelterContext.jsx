import { createContext, useContext, useState } from 'react'

const ShelterContext = createContext()

export function ShelterProvider({ children }) {
    const [shelter, setShelter] = useState(() => {
        const stored = localStorage.getItem('shelter')
        return stored ? JSON.parse(stored) : null
    })

    const [shelterToken, setShelterToken] = useState(() => {
        return localStorage.getItem('shelter_token') || null
    })

    const loginShelter = (shelterData, token) => {
        setShelter(shelterData)
        setShelterToken(token)
        localStorage.setItem('shelter',       JSON.stringify(shelterData))
        localStorage.setItem('shelter_token', token)
    }

    const logoutShelter = () => {
        setShelter(null)
        setShelterToken(null)
        localStorage.removeItem('shelter')
        localStorage.removeItem('shelter_token')
    }

    return (
        <ShelterContext.Provider value={{ shelter, shelterToken, loginShelter, logoutShelter }}>
            {children}
        </ShelterContext.Provider>
    )
}

export const useShelter = () => useContext(ShelterContext)