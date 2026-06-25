export interface VideoFilterSettings {
  brightness: number;     // -100 to 100, default 0
  contrast: number;       // -100 to 100, default 0
  saturation: number;     // -100 to 100, default 0
  warmth: number;         // -100 to 100, default 0
  noiseReduction: number; // 0 to 100, default 0
  shadowRecovery: number; // 0 to 100, default 0
  sharpness: number;      // 0 to 100, default 0
}

export const DEFAULT_FILTERS: VideoFilterSettings = {
  brightness: 10,
  contrast: 5,
  saturation: 8,
  warmth: 3,
  noiseReduction: 15,
  shadowRecovery: 20,
  sharpness: 10,
};

const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform float u_brightness;
  uniform float u_contrast;
  uniform float u_saturation;
  uniform float u_warmth;
  uniform float u_shadowRecovery;
  uniform float u_sharpness;
  uniform vec2 u_textureSize;

  vec3 adjustBrightness(vec3 color, float value) {
    return color + value;
  }

  vec3 adjustContrast(vec3 color, float value) {
    return 0.5 + (1.0 + value) * (color - 0.5);
  }

  vec3 adjustSaturation(vec3 color, float value) {
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    return mix(vec3(luminance), color, 1.0 + value);
  }

  vec3 adjustWarmth(vec3 color, float value) {
    color.r += value * 0.5;
    color.b -= value * 0.5;
    return color;
  }

  vec3 recoverShadows(vec3 color, float value) {
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float shadowMask = 1.0 - smoothstep(0.0, 0.5, luminance);
    return color + shadowMask * value * 0.5;
  }

  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 rgb = color.rgb;

    rgb = adjustBrightness(rgb, u_brightness);
    rgb = adjustContrast(rgb, u_contrast);
    rgb = adjustSaturation(rgb, u_saturation);
    rgb = adjustWarmth(rgb, u_warmth);
    rgb = recoverShadows(rgb, u_shadowRecovery);

    // Simple sharpening via unsharp mask approximation
    if (u_sharpness > 0.0) {
      vec2 texelSize = 1.0 / u_textureSize;
      vec3 blur = vec3(0.0);
      blur += texture2D(u_image, v_texCoord + vec2(-texelSize.x, 0.0)).rgb;
      blur += texture2D(u_image, v_texCoord + vec2(texelSize.x, 0.0)).rgb;
      blur += texture2D(u_image, v_texCoord + vec2(0.0, -texelSize.y)).rgb;
      blur += texture2D(u_image, v_texCoord + vec2(0.0, texelSize.y)).rgb;
      blur *= 0.25;
      rgb = rgb + (rgb - blur) * u_sharpness;
    }

    gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
  }
`;

export class VideoFilterPipeline {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }
    this.initShaders();
    this.initBuffers();
    this.texture = this.gl.createTexture();
  }

  private initShaders() {
    const gl = this.gl!;
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAGMENT_SHADER);
    gl.compileShader(fs);

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.useProgram(this.program);
  }

  private initBuffers() {
    const gl = this.gl!;
    const program = this.program!;

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1,
    ]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 1,  1, 1,  0, 0,
      0, 0,  1, 1,  1, 0,
    ]), gl.STATIC_DRAW);
    const texLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
  }

  render(source: HTMLVideoElement | HTMLCanvasElement, filters: VideoFilterSettings) {
    const gl = this.gl;
    const program = this.program;
    if (!gl || !program || !this.texture) return;

    const width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    const height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
    if (!width || !height) return;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    gl.uniform1f(gl.getUniformLocation(program, 'u_brightness'), filters.brightness / 200);
    gl.uniform1f(gl.getUniformLocation(program, 'u_contrast'), filters.contrast / 100);
    gl.uniform1f(gl.getUniformLocation(program, 'u_saturation'), filters.saturation / 100);
    gl.uniform1f(gl.getUniformLocation(program, 'u_warmth'), filters.warmth / 100);
    gl.uniform1f(gl.getUniformLocation(program, 'u_shadowRecovery'), filters.shadowRecovery / 100);
    gl.uniform1f(gl.getUniformLocation(program, 'u_sharpness'), filters.sharpness / 100);
    gl.uniform2f(gl.getUniformLocation(program, 'u_textureSize'), width, height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  destroy() {
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
    }
    if (this.gl && this.texture) {
      this.gl.deleteTexture(this.texture);
    }
  }
}
