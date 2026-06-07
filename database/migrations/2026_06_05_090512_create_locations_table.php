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
        Schema::create('locations', function (Blueprint $table) { // Esta aplicación está pensada únicamente para las protectoras en España.
            $table->id(); // ID autonumérico (PK)
            $table->string('autonomous_community'); // Comunidad Autónoma
            $table->string('province'); // Provincia
            $table->string('municipality'); // Municipio
            
            $table->unique(['autonomous_community', 'province', 'municipality']); // El índice jerárquico permite optimizar las consultas
                                                                                 // por el ámbito geográfico
            
            $table->timestamps(); // Añade los campos 'created_at' y 'updated_at' a la tabla
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
