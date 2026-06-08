<?php

namespace App\Models;

use App\Enums\AnimalSpecies;
use App\Enums\AnimalGender;
use App\Enums\AnimalAgeRange;
use App\Enums\AnimalStatus;
use App\Enums\AnimalSize;
use App\Enums\AnimalActivityLevel;
use App\Enums\AnimalMaxHoursAlone;
use App\Enums\CatCompanionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Animal extends Model
{
    // Campos de la tabla que dejamos rellenar desde el formulario de la web
    protected $fillable = [
        'shelter_id',          // ID de la protectora a la que pertenece (FK)
        'name',                // nombre del animal
        'species',             // si es un perro o un gato
        'gender',              // género: macho o hembra
        'breed',               // la raza del animal
        'age_range',           // para filtrar por edad (cachorro, adulto...)
        'good_with_kids',      // si es compatible con niños (clave para el match)
        'good_with_cats',      // si puede vivir con gatos
        'good_with_dogs',      // si se lleva bien con otros perros
        'good_with_strangers', // si tiene miedo a los desconocidos
        'special_needs',       // si tiene alguna enfermedad o necesita cuidados
        'status',              // estado del animal (disponible, adoptado...)
        'description',         // la historia o descripción que saldrá en la ficha
        'image_url',           // enlace de la foto subida a Cloudinary
        'size',                // tamaño del animal (pequeño, mediano, grande)
        'activity_level',      // nivel de energía relevante para el match con el dueño
        'max_hours_alone',     // horas máximas que aguanta solo en casa
        'cat_companion_type',  // si es un gato que necesita estar con otros felinos
        'indoor_only',         // si el gato es solo para vivir en piso cerrado
    ];

    // Convertimos los campos a sus tipos correspondientes o enums de Laravel
    protected $casts = [
        'species'             => AnimalSpecies::class,
        'gender'              => AnimalGender::class,
        'age_range'           => AnimalAgeRange::class,
        'status'              => AnimalStatus::class,
        'size'                => AnimalSize::class,
        'activity_level'      => AnimalActivityLevel::class,
        'max_hours_alone'     => AnimalMaxHoursAlone::class,
        'cat_companion_type'  => CatCompanionType::class,
        'good_with_kids'      => 'boolean',
        'good_with_cats'      => 'boolean',
        'good_with_dogs'      => 'boolean',
        'good_with_strangers' => 'boolean',
        'special_needs'       => 'boolean',
        'indoor_only'         => 'boolean',
    ];

    // Un animal pertenece a una protectora específica
    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class);
    }

    // Un animal puede recibir muchas solicitudes de match de los usuarios
    public function requests(): HasMany
    {
        return $this->hasMany(Request::class);
    }

    // Un animal puede tener campañas de donación asociadas para recaudar fondos
    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    // Filtro para sacar solo los animales que están disponibles en la web
    public function scopeAvailable($query)
    {
        return $query->where('status', AnimalStatus::AVAILABLE);
    }

    // Filtro para buscar solo perros en el catálogo
    public function scopeDogs($query)
    {
        return $query->where('species', AnimalSpecies::DOG);
    }

    // Filtro para buscar solo gatos en el catálogo
    public function scopeCats($query)
    {
        return $query->where('species', AnimalSpecies::CAT);
    }

    // Función para comprobar si es un perro
    public function isDog(): bool
    {
        return $this->species === AnimalSpecies::DOG;
    }

    // Función para comprobar si es un gato
    public function isCat(): bool
    {
        return $this->species === AnimalSpecies::CAT;
    }
}