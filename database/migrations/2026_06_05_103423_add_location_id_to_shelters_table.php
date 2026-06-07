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
        Schema::table('shelters', function (Blueprint $table) { // Al crear primero la tabla 'shelters' antes que 'locations' se puede añadir 
                                                                // la clave foránea mediante otra migración
            $table->foreignId('location_id')
                ->constrained()
                ->onDelete('restrict'); // Esta restricción impide eliminar ubicaciones si tiene protectoras relacionadas
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void // Esta función permite eliminar la clave foránea en caso de que sea necesario hacer un rollback
    {
        Schema::table('shelters', function (Blueprint $table) {
            $table->dropForeign(['location_id']); 
            $table->dropColumn('location_id');
        });
    }
};
