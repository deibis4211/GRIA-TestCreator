# Creador de tests

## Resumen

Esto es un programa que crea exámenes tipo tests eligiendo las preguntas y poniendo el orden de las respuestas de manera aleatoria. Una vez generado el html se puede responder al examen y se autocorrige y da la nota que se ha sacado. Las preguntas no están en este repositorio, están en [Questions](https://github.com/santiagorr2004/GRIA-Questions).

## Uso

Hay tres maneras de generar exámenes:

### 1. **Ejecutar el script directamente**

Si se usa el fichero [main.py](/main.py) se puede ejecutar y tras abrir una ventana de tkinter se puede generar ficheros html.

### 2. **Crear una página web local**

Usando el comando `python3 -m http.server 8000` se puede usar [http://localhost:8000](http://localhost:8000) para acceder a la aplicación web generada. Es necesario tener los ficheros de las preguntas previamente descargados, lo que requiere ejecutar el script [download](./UTILS/download.py).

### 3. **Usar GitHub Pages**

El enlace es el repositorio [TestCreator](https://santiagorr2004.github.io/GRIA-TestCreator/). Es posible que no funcione si recargas mucho la página porque para obtener las preguntas se usa la API de GitHub.

## Contribuir

**Importante:** Al hacer un pull request se realiza una comprobación de formateo que para pasarla deben estar los ficheros con un formato en específico. La mejor manera de asegurarse de que esto siempre ocurra es ejecutar la acción sobre formateo en el fork que has creado. Es necesario que sea en el fork; y solo se necesita una vez manualmente, ya que se ejecuta cada vez que haya un cambio en el fork. No se ejecuta de manera automática inicialmente por razones de seguridad en GitHub.

Se pueden añadir más tipos de preguntas en la carpeta [scripts/questions](./scripts/questions) y más tipos de estilos en la carpeta [styles](./styles).
