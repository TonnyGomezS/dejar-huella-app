<?php

use App\Enums\PaymentStatus;
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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            
            // Relaciones (FK)
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Datos financieros
            // Usamos decimal para evitar errores de redondeo en operaciones contables
            $table->decimal('amount', 10, 2); 
            
            // Estado del pago: permitimos 'failed' para tener trazabilidad de intentos fallidos
            $table->string('payment_status')->default(PaymentStatus::PENDING->value);
            
            // Pro-tip: Añade esto para integrar pasarelas reales (Stripe/PayPal) en el futuro
            $table->string('transaction_id')->nullable(); 
            
            $table->timestamps();

            // Índices para analíticas financieras
            $table->index(['campaign_id', 'payment_status']); // Crucial para sumar el total de una campaña
            $table->index(['user_id', 'payment_status']);     // Crucial para que el usuario vea su historial
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
