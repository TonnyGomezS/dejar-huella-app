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
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            
            // Relaciones (FK)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('animal_id')->constrained()->onDelete('cascade');
            
            // Identificador de la naturaleza de la solicitud
            $table->string('type');
            
            // Estado del workflow (gestión de la solicitud)
            $table->string('status')
                ->default('pending');
            
            $table->text('message')->nullable();
            
            // Fecha fin para acogidas temporales (fostering)
            $table->date('end_date')->nullable();
            
            $table->timestamps();

            // Índices estratégicos
            // Optimiza la visualización de solicitudes por parte de la protectora
            $table->index(['animal_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->unique(['user_id', 'animal_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
