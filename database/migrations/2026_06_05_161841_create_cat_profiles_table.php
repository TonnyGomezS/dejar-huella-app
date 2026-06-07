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
        Schema::create('cat_profiles', function (Blueprint $table) {
            $table->id(); // Clave primaria para mantener la integridad referencial
            
            // Incorporamos esta clave foránea para relacionar al usuario con el perfil de compatibilidad para gatos (relación 1:1)
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');
            
            // Atributos del usuario relevantes para la adopción/acogida/apadrinamiento de un gato
            
            $table->string('hours_at_home');
            $table->boolean('has_outdoor_access')->default(false);
            $table->boolean('can_secure_windows')->default(false); // CRÍTICO: Anti-caídas
            $table->boolean('has_vertical_space')->default(false); // CRÍTICO: Rascadores/estantes
            
            // Nivel de experiencia previa del solicitante con gatos
            $table->string('experience_level');
            
            $table->string('companion_type'); // He ajustado 'indifferent' a 'balanced' para alinear con tu tabla 'animals'
            // Si el solicitante está dispuesto a aceptar a un perro con necesidades especiales
            $table->boolean('accepts_special_needs')->default(false);
            
            // Aquí se recoge si el solicitante tiene hijos menores (de 6 años, por ejemplo) en casa
            $table->boolean('has_young_children')->default(false); 
            // Si el solicitante tiene perros u otros gatos en casa
            $table->boolean('has_other_cats')->default(false);
            $table->boolean('has_dogs')->default(false);

            
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cat_profiles');
    }
};
