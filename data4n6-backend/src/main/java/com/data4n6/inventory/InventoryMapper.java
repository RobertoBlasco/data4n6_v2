package com.data4n6.inventory;

import com.data4n6.inventory.articulo.Articulo;
import com.data4n6.inventory.articulo.dto.ArticuloResponse;
import com.data4n6.inventory.material.Material;
import com.data4n6.inventory.material.dto.MaterialResponse;
import com.data4n6.inventory.categoriarticulo.CategoriaArticulo;
import com.data4n6.inventory.categoriarticulo.dto.CategoriaArticuloRequest;
import com.data4n6.inventory.categoriarticulo.dto.CategoriaArticuloResponse;
import com.data4n6.inventory.marca.T200Marca;
import com.data4n6.inventory.marca.dto.T200MarcaRequest;
import com.data4n6.inventory.marca.dto.T200MarcaResponse;
import com.data4n6.inventory.tipomaterial.TipoMaterial;
import com.data4n6.inventory.tipomaterial.dto.TipoMaterialRequest;
import com.data4n6.inventory.tipomaterial.dto.TipoMaterialResponse;
import com.data4n6.inventory.almacen.Almacen;
import com.data4n6.inventory.almacen.dto.AlmacenRequest;
import com.data4n6.inventory.almacen.dto.AlmacenResponse;
import com.data4n6.inventory.tipoalmacen.TipoAlmacen;
import com.data4n6.inventory.tipoalmacen.dto.TipoAlmacenRequest;
import com.data4n6.inventory.tipoalmacen.dto.TipoAlmacenResponse;
import com.data4n6.inventory.modelo.Modelo;
import com.data4n6.inventory.modelo.dto.ModeloRequest;
import com.data4n6.inventory.modelo.dto.ModeloResponse;
import com.data4n6.inventory.materialmarca.MaterialMarca;
import com.data4n6.inventory.materialmarca.dto.MaterialMarcaResponse;
import com.data4n6.inventory.evento.Evento;
import com.data4n6.inventory.evento.dto.EventoResponse;
import com.data4n6.inventory.eventotransicion.EventoTransicion;
import com.data4n6.inventory.eventotransicion.dto.EventoTransicionResponse;
import com.data4n6.inventory.tipoentrada.TipoEntrada;
import com.data4n6.inventory.tipoentrada.dto.TipoEntradaResponse;
import com.data4n6.inventory.proveedor.Proveedor;
import com.data4n6.inventory.proveedor.dto.ProveedorResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface InventoryMapper {

    // ── TipoEntrada ───────────────────────────────────────────────────────────

    TipoEntradaResponse toResponse(TipoEntrada tipoEntrada);

    // ── Proveedor ─────────────────────────────────────────────────────────────

    ProveedorResponse toResponse(Proveedor proveedor);

    // ── T200Marca ─────────────────────────────────────────────────────────────

    T200MarcaResponse toResponse(T200Marca marca);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    T200Marca toEntity(T200MarcaRequest request);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void update(T200MarcaRequest request, @MappingTarget T200Marca marca);

    // ── TipoMaterial ──────────────────────────────────────────────────────────

    TipoMaterialResponse toResponse(TipoMaterial material);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    TipoMaterial toEntity(TipoMaterialRequest request);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void update(TipoMaterialRequest request, @MappingTarget TipoMaterial material);

    // ── CategoriaArticulo ─────────────────────────────────────────────────────

    CategoriaArticuloResponse toResponse(CategoriaArticulo categoria);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    CategoriaArticulo toEntity(CategoriaArticuloRequest request);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void update(CategoriaArticuloRequest request, @MappingTarget CategoriaArticulo categoria);

    // ── Evento ────────────────────────────────────────────────────────────────

    EventoResponse toResponse(Evento evento);

    // ── EventoTransicion ──────────────────────────────────────────────────────

    @Mapping(target = "eventoOrigenId",      source = "eventoOrigen.id")
    @Mapping(target = "eventoOrigenNombre",  source = "eventoOrigen.nombre")
    @Mapping(target = "eventoDestinoId",     source = "eventoDestino.id")
    @Mapping(target = "eventoDestinoNombre", source = "eventoDestino.nombre")
    EventoTransicionResponse toResponse(EventoTransicion transicion);

    // ── TipoAlmacen ───────────────────────────────────────────────────────────

    TipoAlmacenResponse toResponse(TipoAlmacen tipo);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    TipoAlmacen toEntity(TipoAlmacenRequest request);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void update(TipoAlmacenRequest request, @MappingTarget TipoAlmacen tipo);

    // ── Almacen ───────────────────────────────────────────────────────────────

    @Mapping(target = "tipoAlmacenId",     source = "tipoAlmacen.id")
    @Mapping(target = "tipoAlmacenNombre", source = "tipoAlmacen.name")
    AlmacenResponse toResponse(Almacen almacen);

    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "deletedAt",   ignore = true)
    @Mapping(target = "tipoAlmacen", ignore = true)
    Almacen toEntity(AlmacenRequest request);

    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "deletedAt",   ignore = true)
    @Mapping(target = "tipoAlmacen", ignore = true)
    void update(AlmacenRequest request, @MappingTarget Almacen almacen);

    // ── Modelo ────────────────────────────────────────────────────────────────

    @Mapping(target = "tipoMaterialId",     source = "tipoMaterial.id")
    @Mapping(target = "tipoMaterialNombre", source = "tipoMaterial.name")
    @Mapping(target = "marcaId",            source = "marca.id")
    @Mapping(target = "marcaNombre",        source = "marca.name")
    ModeloResponse toResponse(Modelo modelo);

    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "deletedAt",   ignore = true)
    @Mapping(target = "tipoMaterial", ignore = true)
    @Mapping(target = "marca",        ignore = true)
    Modelo toEntity(ModeloRequest request);

    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "deletedAt",   ignore = true)
    @Mapping(target = "tipoMaterial", ignore = true)
    @Mapping(target = "marca",        ignore = true)
    void update(ModeloRequest request, @MappingTarget Modelo modelo);

    // ── MaterialMarca ─────────────────────────────────────────────────────────

    @Mapping(target = "tipoMaterialId",     source = "tipoMaterial.id")
    @Mapping(target = "tipoMaterialNombre", source = "tipoMaterial.name")
    @Mapping(target = "marcaId",            source = "marca.id")
    @Mapping(target = "marcaNombre",        source = "marca.name")
    MaterialMarcaResponse toResponse(MaterialMarca materialMarca);

    // ── Material ──────────────────────────────────────────────────────────────

    @Mapping(target = "tipoMaterialId",     source = "tipoMaterial.id")
    @Mapping(target = "tipoMaterialNombre", source = "tipoMaterial.name")
    @Mapping(target = "marcaId",            source = "marca.id")
    @Mapping(target = "marcaNombre",        source = "marca.name")
    @Mapping(target = "modeloId",           source = "modelo.id")
    @Mapping(target = "modeloDescripcion",  source = "modelo.description")
    MaterialResponse toResponse(Material material);

    // ── Articulo ──────────────────────────────────────────────────────────────

    @Mapping(target = "tipoMaterialId",     source = "tipoMaterial.id")
    @Mapping(target = "tipoMaterialNombre", source = "tipoMaterial.name")
    @Mapping(target = "brandId",            source = "brand.id")
    @Mapping(target = "brandName",          source = "brand.name")
    @Mapping(target = "almacenId",          source = "almacen.id")
    @Mapping(target = "almacenNombre",      source = "almacen.name")
    @Mapping(target = "modeloId",           source = "modelo.id")
    @Mapping(target = "modeloDescripcion",  source = "modelo.description")
    ArticuloResponse toResponse(Articulo articulo);
}
