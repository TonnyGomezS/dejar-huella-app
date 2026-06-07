import { Routes, Route } from 'react-router-dom'
import { ProtectedUserRoute, ProtectedShelterRoute, ProtectedAdminRoute } from './components/common/ProtectedRoute'
import Navbar from './components/common/Navbar'

// Páginas públicas
import Home           from './pages/public/Home'
import AnimalList     from './pages/public/AnimalList'
import AnimalDetail   from './pages/public/AnimalDetail'
import ShelterList    from './pages/public/ShelterList'
import ShelterDetail  from './pages/public/ShelterDetail'
import EventList      from './pages/public/EventList'
import CampaignList   from './pages/public/CampaignList'
import CampaignDetail from './pages/public/CampaignDetail'
import HowToUse       from './pages/public/HowToUse'

// Autenticación
import Login           from './pages/auth/Login'
import Register        from './pages/auth/Register'
import ShelterLogin    from './pages/auth/ShelterLogin'
import ShelterRegister from './pages/auth/ShelterRegister'

// Panel usuario
import UserDashboard from './pages/user/Dashboard'
import UserRequests  from './pages/user/Requests'
import UserDonations from './pages/user/Donations'
import UserEvents    from './pages/user/Events'
import Compatibility from './pages/user/Compatibility'

// Panel protectora
import ShelterDashboard from './pages/shelter/Dashboard'
import ShelterAnimals   from './pages/shelter/Animals'
import ShelterCampaigns from './pages/shelter/Campaigns'
import ShelterEvents    from './pages/shelter/Events'
import ShelterRequests  from './pages/shelter/Requests'
import ShelterVolunteer      from './pages/shelter/Volunteer'
import ShelterNotifications  from './pages/shelter/Notifications'
import ShelterAnimalCreate from './pages/shelter/AnimalCreate'
import ShelterAnimalEdit from './pages/shelter/AnimalEdit'
import ShelterEventCreate from './pages/shelter/EventCreate'
import ShelterEventEdit from './pages/shelter/EventEdit'
import ShelterCampaignCreate from './pages/shelter/CampaignCreate'
import ShelterCampaignEdit from './pages/shelter/CampaignEdit'

// Panel admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers     from './pages/admin/Users'
import AdminShelters  from './pages/admin/Shelters'

export default function App() {
    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    {/* Públicas */}
                    <Route path="/"              element={<Home />} />
                    <Route path="/animals"       element={<AnimalList />} />
                    <Route path="/animals/:id"   element={<AnimalDetail />} />
                    <Route path="/shelters"      element={<ShelterList />} />
                    <Route path="/shelters/:id"  element={<ShelterDetail />} />
                    <Route path="/events"        element={<EventList />} />
                    <Route path="/campaigns"     element={<CampaignList />} />
                    <Route path="/campaigns/:id" element={<CampaignDetail />} />

                    {/* Autenticación */}
                    <Route path="/login"             element={<Login />} />
                    <Route path="/register"          element={<Register />} />
                    <Route path="/shelters/login"    element={<ShelterLogin />} />
                    <Route path="/shelters/register" element={<ShelterRegister />} />

                    {/* Panel usuario */}
                    <Route path="/dashboard" element={
                        <ProtectedUserRoute><UserDashboard /></ProtectedUserRoute>
                    }/>
                    <Route path="/dashboard/requests" element={
                        <ProtectedUserRoute><UserRequests /></ProtectedUserRoute>
                    }/>
                    <Route path="/dashboard/donations" element={
                        <ProtectedUserRoute><UserDonations /></ProtectedUserRoute>
                    }/>
                    <Route path="/dashboard/events" element={
                        <ProtectedUserRoute><UserEvents /></ProtectedUserRoute>
                    }/>
                    <Route path="/dashboard/compatibility" element={
                        <ProtectedUserRoute><Compatibility /></ProtectedUserRoute>
                    }/>

                    {/* Panel protectora */}
                    <Route path="/shelter/dashboard" element={
                        <ProtectedShelterRoute><ShelterDashboard /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/animals/create" element={
                        <ProtectedShelterRoute><ShelterAnimalCreate /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/animals/:id/edit" element={
                        <ProtectedShelterRoute><ShelterAnimalEdit /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/animals" element={
                        <ProtectedShelterRoute><ShelterAnimals /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/requests" element={
                        <ProtectedShelterRoute><ShelterRequests /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/events" element={
                        <ProtectedShelterRoute><ShelterEvents /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/events/create" element={
                        <ProtectedShelterRoute><ShelterEventCreate /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/events/:id/edit" element={
                        <ProtectedShelterRoute><ShelterEventEdit /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/campaigns" element={
                        <ProtectedShelterRoute><ShelterCampaigns /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/campaigns/create" element={
                        <ProtectedShelterRoute><ShelterCampaignCreate /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/campaigns/:id/edit" element={
                        <ProtectedShelterRoute><ShelterCampaignEdit /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/volunteer" element={
                        <ProtectedShelterRoute><ShelterVolunteer /></ProtectedShelterRoute>
                    }/>
                    <Route path="/shelter/notifications" element={
                        <ProtectedShelterRoute><ShelterNotifications /></ProtectedShelterRoute>
                    }/>

                    {/* Panel admin */}
                    <Route path="/admin" element={
                        <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>
                    }/>
                    <Route path="/admin/users" element={
                        <ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>
                    }/>
                    <Route path="/admin/shelters" element={
                        <ProtectedAdminRoute><AdminShelters /></ProtectedAdminRoute>
                    }/>
                    <Route path="/como-funciona" element={<HowToUse />} />
                    
                </Routes>
            </main>
        </>
    )
}