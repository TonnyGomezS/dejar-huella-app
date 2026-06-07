<?php

use App\Enums\VolunteerRequestStatus;
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
        Schema::create('volunteer_requests', function (Blueprint $table) {
            $table->id();
            
            // Relaciones (FK)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('shelter_id')->constrained()->onDelete('cascade');
            
            // Datos de la solicitud
            $table->string('availability');
            $table->string('interests'); // Considera convertirlo en json si quieres almacenar múltiples intereses
            $table->text('message')->nullable();
            
            // Estado de la gestión
            $table->string('status')->default(VolunteerRequestStatus::PENDING->value);
            
            $table->timestamps();

            // Índices para optimizar la bandeja de entrada de la protectora
            $table->index(['shelter_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('volunteer_requests');
    }
};
