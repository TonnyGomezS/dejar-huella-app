<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dog_profiles', function (Blueprint $table) {
            $table->id(); // Clave primaria de la tabla
            
            // Cada usuario tiene un único perfil de compatibilidad (relación 1:1). Si el usuario es eliminado, su perfil de compatibilidad también se elimina.
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');
            
            // Atributos del usuario relevantes para la adopción/acogida/apadrinamiento de un perro
            
            // Tipo de vivienda del solicitante: relevante en relación al nivel de actividad del perro
            $table->string('housing_type');
            // Nivel de disponibilidad: indica si el solicitante (o algún familiar) dispone o no de tiempo suficiente para pasar tiempo con el perro
            $table->string('free_time');
            // Nivel de experiencia previa del solicitante con perros
            $table->string('experience_level');
            // Aquí se recoge si el solicitante tiene hijos menores (de 6 años, por ejemplo) en el hogar
            $table->boolean('has_young_children')->default(false); 
            // Si el solicitante tiene gatos u otros perros en casa
            $table->boolean('has_cats')->default(false);
            $table->boolean('has_other_dogs')->default(false);
            // Si el solicitante está dispuesto a aceptar a un perro con necesidades especiales
            $table->boolean('accepts_special_needs')->default(false);
            
            $table->timestamps(); // Campos timestamp 'created_at' y 'updated_at'

            // Índice para optimizar la búsqueda del perfil del solicitante
            $table->unique('user_id'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dog_profiles');
    }
};
