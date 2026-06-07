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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            
            // Relación con la protectora organizadora
            $table->foreignId('shelter_id')
                ->constrained()
                ->onDelete('cascade');
            
            $table->string('title');
            $table->text('description');
            $table->dateTime('event_date');
            $table->string('location');
            
            // Control de capacidad
            $table->integer('max_volunteers')->unsigned();
            
            // Tipo de evento (Normalizado mediante enum)
            $table->string('type');
            
            $table->timestamps();

            // Índices para mejorar el rendimiento del calendario y listados
            $table->index('shelter_id');
            $table->index('event_date'); // Fundamental para ordenar eventos próximos
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
