<?php

use App\Enums\EventRegistrationStatus;
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
        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            
            // Relaciones (FK)
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Estado del registro: permite tracking sin borrar el histórico
            $table->string('status')->default(EventRegistrationStatus::CONFIRMED->value);
            
            $table->timestamps();

            // Índice para optimizar consultas de conteo y listados
            // Este índice es vital para el '->count()' de plazas ocupadas
            $table->index(['event_id', 'status']);
            $table->unique(['user_id', 'event_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_registrations');
    }
};
