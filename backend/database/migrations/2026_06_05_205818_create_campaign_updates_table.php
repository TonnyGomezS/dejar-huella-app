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
        Schema::create('campaign_updates', function (Blueprint $table) {
            $table->id();
            
            // Relación con la campaña (si la campaña se elimina, sus actualizaciones también)
            $table->foreignId('campaign_id')
                ->constrained()
                ->onDelete('cascade');
            
            $table->string('title');
            $table->text('content');
            
            // URL opcional: no todas las actualizaciones necesitan foto
            $table->string('image_url')->nullable();
            
            $table->timestamps();

            // Índice para optimizar la carga del "muro" de actualizaciones de una campaña
            $table->index('campaign_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_updates');
    }
};
