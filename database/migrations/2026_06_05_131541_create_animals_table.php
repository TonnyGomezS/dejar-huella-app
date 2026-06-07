<?php

use App\Enums\AnimalStatus;
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
        Schema::create('animals', function (Blueprint $table) { // Tabla de gestión del 'inventario' animal. Es única para facilitar la consulta del catálogo y la implementación 
                                                                // del algoritmo de matching.
            $table->id(); // Clave primaria (ID autonumérico): garantiza la integridad referencial.
            $table->foreignId('shelter_id') // Utilizamos este campo como FK para relacionar cada animal con la protectora a la que pertenece
                ->constrained()
                ->onDelete('cascade'); // En caso de que se elimine una protectora del sistema, los animales asociados a ella también se eliminan.    
            $table->string('name'); // Nombre del animal registrado por la protectora.
            $table->string('species'); // Para el MVP solo se incluyen a perros y gatos, excluyendo otros animales.
            $table->string('gender'); // Género
            $table->string('breed')->nullable(); // Raza
            $table->string('age_range'); // Etapas principales en la vida de un animal
            
            // Estos campos recogen los rasgos principales de comportamiento del animal, su nivel de sociabilidad.
            $table->boolean('good_with_kids')->default(false);
            $table->boolean('good_with_cats')->default(false);
            $table->boolean('good_with_dogs')->default(false);
            $table->boolean('good_with_strangers')->default(false);
            
            // Este campo recoge si el animal requiere de cuidados especiales en su vida diaria
            $table->boolean('special_needs')->default(false);
            
            // Este campo es fundamental para diferenciar a los animales según su estado (mostrando primero los que están disponibles o 
            // eliminando aquellos que han sido adoptados)
            $table->string('status')->default(AnimalStatus::AVAILABLE->value);
                
            $table->text('description')->nullable(); // Breve descripción del animal
            $table->string('image_url')->nullable(); // Este campo recoge la URL de la imagen de cada perro/gato

            // Estos campos son específicos para los perros (en caso de gatos estos campos serán nulos)
            $table->string('size')->nullable();
            $table->string('activity_level')->nullable();
            $table->string('max_hours_alone')->nullable();

            // Estos campos son específicos para los gatos (en caso de perros estos campos serán nulos)
            $table->string('cat_companion_type')->nullable();
            $table->boolean('indoor_only')->nullable();

            $table->timestamps(); // Incorpora los campos 'created_at' y 'updated_at' a la tabla

            // Índice que optimiza el filtrado de los animales a nivel jerárquico (de izquierda a derecha desde el estado hasta el rango de edad)
            $table->index(['species', 'status', 'gender', 'age_range']); 
            $table->index('shelter_id'); // índice para hacer el filtrado directamente por protectora
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animals');
    }
};
