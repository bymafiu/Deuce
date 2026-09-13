/* ============================================================
   deuce · temas y desbloqueos
   ------------------------------------------------------------
   Script clásico (no módulo) para poder cargarlo en el <head>
   y aplicar el tema antes del primer pintado. Expone la misma
   API que la versión de referencia en window.DeuceTemas.
   ============================================================ */
(function () {
  var TEMAS = {
    base: {
      nombre: 'Clásico', nombreEn: 'Classic',
      oscuro: false, bloqueado: false,
      pista: null, pistaEn: null,
      motivo: null, motivoEn: null,
      muestra: ['#FAF8F3', '#15130F'],
      comoSeConsigue: null
    },
    tierra: {
      nombre: 'Tierra batida', nombreEn: 'Clay',
      oscuro: false, bloqueado: true,
      pista: 'Gana un Grand Slam sobre tierra.', pistaEn: 'Win a Grand Slam on clay.',
      motivo: 'Por ganar un grande en tierra', motivoEn: 'For winning a major on clay',
      muestra: ['#FAF5EE', '#B4562C'],
      comoSeConsigue: function (c) {
        return (c.titulos || []).some(function (t) { return t.categoria === 'slam' && t.superficie === 'tierra'; });
      }
    },
    dura: {
      nombre: 'Pista dura', nombreEn: 'Hard court',
      oscuro: false, bloqueado: true,
      pista: 'Llega al número uno del mundo.', pistaEn: 'Reach world number one.',
      motivo: 'Por llegar al número uno', motivoEn: 'For reaching number one',
      muestra: ['#F7F6F2', '#1F5C8C'],
      comoSeConsigue: function (c) { return c.mejorPuesto === 1; }
    },
    hierba: {
      nombre: 'Hierba', nombreEn: 'Grass',
      oscuro: false, bloqueado: true,
      pista: 'Gana un título sobre hierba.', pistaEn: 'Win a title on grass.',
      motivo: 'Por ganar un título en hierba', motivoEn: 'For winning a title on grass',
      muestra: ['#F8F7F0', '#2F6B3C'],
      comoSeConsigue: function (c) {
        return (c.titulos || []).some(function (t) { return t.superficie === 'hierba'; });
      }
    },
    grafito: {
      nombre: 'Grafito', nombreEn: 'Graphite',
      oscuro: true, bloqueado: true,
      pista: 'Llega hasta la retirada en una carrera.', pistaEn: 'Reach retirement in one career.',
      motivo: 'Por llegar hasta la retirada', motivoEn: 'For reaching retirement',
      muestra: ['#1C1E20', '#EDEEEF'],
      comoSeConsigue: function (c) { return c.edadRetirada > 34; }
    }
  };

  var CLAVE_TEMA = 'deuce.tema';
  var CLAVE_DESB = 'deuce.temasDesbloqueados';
  var CLAVE_VIS = 'deuce.temasVistos';

  function leer(clave, porDefecto) {
    try {
      var v = localStorage.getItem(clave);
      return v ? JSON.parse(v) : porDefecto;
    } catch (e) { return porDefecto; }
  }

  function escribir(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* modo privado */ }
  }

  function desbloqueados() {
    var guardados = leer(CLAVE_DESB, []) || [];
    return ['base'].concat(guardados.filter(function (t) { return t !== 'base' && TEMAS[t]; }));
  }

  function temaActual() {
    var t = leer(CLAVE_TEMA, 'base');
    return desbloqueados().indexOf(t) >= 0 ? t : 'base';
  }

  function aplicar(tema) {
    if (!TEMAS[tema] || desbloqueados().indexOf(tema) < 0) return false;
    document.documentElement.dataset.tema = tema;
    escribir(CLAVE_TEMA, tema);
    return true;
  }

  function revisarDesbloqueos(carrera) {
    var yaTiene = leer(CLAVE_DESB, []) || [];
    var nuevos = [];
    Object.keys(TEMAS).forEach(function (clave) {
      var tema = TEMAS[clave];
      if (!tema.bloqueado || yaTiene.indexOf(clave) >= 0) return;
      var cumple = false;
      try { cumple = !!tema.comoSeConsigue(carrera); } catch (e) { cumple = false; }
      if (cumple) { yaTiene.push(clave); nuevos.push(clave); }
    });
    if (nuevos.length) escribir(CLAVE_DESB, yaTiene);
    return nuevos;
  }

  /** Temas desbloqueados que el jugador aún no ha visto en el selector. */
  function sinVer() {
    var vistos = leer(CLAVE_VIS, []) || [];
    return desbloqueados().filter(function (t) { return t !== 'base' && vistos.indexOf(t) < 0; });
  }

  function marcarVistos() { escribir(CLAVE_VIS, desbloqueados()); }

  function listaParaSelector(en) {
    var abiertos = desbloqueados();
    var activo = temaActual();
    return Object.keys(TEMAS).map(function (clave) {
      var t = TEMAS[clave];
      var abierto = abiertos.indexOf(clave) >= 0;
      return {
        clave: clave,
        nombre: en ? t.nombreEn : t.nombre,
        oscuro: t.oscuro,
        muestra: t.muestra,
        abierto: abierto,
        activo: clave === activo,
        pista: abierto ? null : (en ? t.pistaEn : t.pista)
      };
    });
  }

  function iniciar() {
    document.documentElement.dataset.tema = temaActual();
  }

  window.DeuceTemas = {
    TEMAS: TEMAS,
    desbloqueados: desbloqueados,
    temaActual: temaActual,
    aplicar: aplicar,
    revisarDesbloqueos: revisarDesbloqueos,
    listaParaSelector: listaParaSelector,
    sinVer: sinVer,
    marcarVistos: marcarVistos,
    iniciar: iniciar,
    total: Object.keys(TEMAS).length
  };

  iniciar();
})();
