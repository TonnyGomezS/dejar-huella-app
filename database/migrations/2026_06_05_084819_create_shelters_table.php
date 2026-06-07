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
        Schema::create('shelters', function (Blueprint $table) {
            $table->id(); // ID autonumérico (será la PK de nuestra tabla)
            $table->string('name'); // Nombre comercial de la protectora.
            $table->string('email')->unique(); // Email de acceso (y de contacto) de la protectora
            $table->string('password'); // Contraseña (encriptada) para el acceso a la aplicación
            $table->text('description')->nullable(); // Breve descripción de la protectora
            $table->string('address'); // Dirección física de la sede
            $table->string('phone')->nullable(); // Teléfono de contacto
            $table->string('image_url')->nullable(); // URL del logo o imagen de portada
            $table->timestamps(); // Incorpora los campos 'created_at' y 'updated_at' a la tabla
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shelters');
    }
};
