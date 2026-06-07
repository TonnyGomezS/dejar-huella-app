<?php

use App\Enums\UserRole;
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
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // ID autoincremental (será la PK de nuestra tabla)
            $table->string('name'); // nombre del usuario
            $table->string('email')->unique(); // email del usuario
            $table->string('password'); // contraseña
            $table->timestamp('email_verified_at')->nullable(); // registro de emails auténticos
            $table->string('phone')->nullable(); // teléfono de contacto
            $table->string('role')->default(UserRole::USER->value); // roles: usuario estándar o administrador
            $table->rememberToken(); // Permite mantener la sesión activa cuando el usuario marca la opción "recuérdame" al iniciar sesión
            $table->timestamps(); // Crea los campos 'created_at' y 'updated_at' de manera automática
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
