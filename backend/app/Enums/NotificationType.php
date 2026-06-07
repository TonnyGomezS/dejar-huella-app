<?php

namespace App\Enums;

enum NotificationType: string
{
    case ADOPTION_REQUEST_ACCEPTED = 'adoption_request_accepted';
    case ADOPTION_REQUEST_REJECTED = 'adoption_request_rejected';
    case FOSTERING_REQUEST_ACCEPTED = 'fostering_request_accepted';
    case FOSTERING_REQUEST_REJECTED = 'fostering_request_rejected';
    case SPONSORSHIP_REQUEST_ACCEPTED = 'sponsorship_request_accepted';
    case SPONSORSHIP_REQUEST_REJECTED = 'sponsorship_request_rejected';
    case NEW_DONATION = 'new_donation';
    case NEW_ADOPTION_REQUEST = 'new_adoption_request';
    case NEW_FOSTERING_REQUEST = 'new_fostering_request';
    case NEW_SPONSORSHIP_REQUEST = 'new_sponsorship_request';
    case NEW_EVENT_REGISTRATION = 'new_event_registration';
    case NEW_VOLUNTEER_REQUEST = 'new_volunteer_request';
    case CAMPAIGN_UPDATE = 'campaign_update';
    case ANIMAL_STATUS_CHANGED = 'animal_status_changed';

    public function label(): string
    {
        return match($this) {
            self::ADOPTION_REQUEST_ACCEPTED    => '¡Su solicitud de adopción ha sido aceptada!',
            self::ADOPTION_REQUEST_REJECTED    => 'Su solicitud de adopción ha sido rechazada',
            self::FOSTERING_REQUEST_ACCEPTED   => '¡Su solicitud de acogida ha sido aceptada!',
            self::FOSTERING_REQUEST_REJECTED   => 'Su solicitud de acogida ha sido rechazada',
            self::SPONSORSHIP_REQUEST_ACCEPTED => '¡Su solicitud de apadrinamiento ha sido aceptada!',
            self::SPONSORSHIP_REQUEST_REJECTED => 'Su solicitud de apadrinamiento ha sido rechazada',
            self::NEW_DONATION                 => 'Ha recibido una nueva donación',
            self::NEW_ADOPTION_REQUEST         => 'Ha recibido una nueva solicitud de adopción',
            self::NEW_FOSTERING_REQUEST        => 'Ha recibido una nueva solicitud de acogida',
            self::NEW_SPONSORSHIP_REQUEST      => 'Ha recibido una nueva solicitud de apadrinamiento',
            self::NEW_EVENT_REGISTRATION       => 'Un usuario se ha inscrito a tu evento',
            self::NEW_VOLUNTEER_REQUEST        => 'Ha recibido una nueva solicitud de voluntariado',
            self::CAMPAIGN_UPDATE              => 'Nueva actualización en una campaña',
            self::ANIMAL_STATUS_CHANGED        => 'El estado de un animal ha cambiado',
        };
    }
}