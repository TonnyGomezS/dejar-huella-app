<?php

use App\Enums\CampaignStatus;
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
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            
            // Relación obligatoria con la protectora
            $table->foreignId('shelter_id')->constrained()->onDelete('cascade');
            
            // Relación opcional con un animal (nullable)
            $table->foreignId('animal_id')
                ->nullable()
                ->constrained()
                ->onDelete('set null'); // Si el animal se elimina, la campaña sigue existiendo como "general"
            
            $table->string('title');
            $table->text('description');
            
            // Usamos decimal para representar dinero con precisión (10 dígitos en total, 2 decimales)
            $table->decimal('goal_amount', 10, 2);
            
            $table->string('status')->default(CampaignStatus::ACTIVE->value);
            $table->dateTime('end_date');
            
            $table->timestamps();

            // Índices estratégicos
            $table->index(['shelter_id', 'status']); // Optimiza el panel de gestión de la protectora
            $table->index('animal_id'); // Optimiza la carga de campañas vinculadas en el perfil del animal
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
