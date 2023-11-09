"use strict";
// from: https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MjM5ODAxNTM2NA==&action=getalbum&album_id=2083238880157188100&scene=173&from_msgid=2659671344&from_itemidx=1&count=3&nolastread=1#wechat_redirect
// 从 main 函数开始看

// 创建着色器 shader。gl：WebGL 上下文；type：着色器类型；source：着色器文本
function createShader(gl, type, source) {
    // 根据 type 创建着色器
    var shader = gl.createShader(type);
    // 绑定内容文本 source
    gl.shaderSource(shader, source);
    // 编译着色器（将文本内容转换成着色器）
    gl.compileShader(shader);
    // 获取编译后的状态
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    // 获取当前着色器相关信息
    console.log(gl.getShaderInfoLog(shader));
    // 删除失败的着色器
    gl.deleteShader(shader);
}

// 创建着色程序 program。gl：WebGL 上下文；vertexShader：顶点着色器对象；fragmentShader：片元着色器对象
function createProgram(gl, vertexShader, fragmentShader) {
    // 创建着色程序
    var program = gl.createProgram();
    // 让着色程序获取到顶点着色器
    gl.attachShader(program, vertexShader);
    // 让着色程序获取到片元着色器
    gl.attachShader(program, fragmentShader);
    // 将两个着色器与着色程序进行绑定
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
 
    console.log(gl.getProgramInfoLog(program));
    // 绑定失败则删除着色程序
    gl.deleteProgram(program);
}
function initCanvasAndGetGL(){
    const canvas = document.createElement('canvas');
    document.getElementsByTagName('body')[0].appendChild(canvas);
    canvas.width = 400;
    canvas.height = 300;

    return canvas.getContext("webgl");
}
const vertexShaderSource = `
    // 接收顶点位置数据
    attribute vec2 a_position;
    // 增加顶点颜色数据
    attribute vec4 a_color;
    // 输出顶点颜色数据给片元着色器
    varying vec4 xx2_color;
    // 着色器入口函数
    void main() {
        xx2_color = a_color;
        // gl_Position 接收的就是一个 vec4，因此需要转换
        gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

const fragmentShaderSource = `
    precision mediump float;
    // 接收来自顶点着色器的颜色属性
    varying vec4 xx2_color;
    // 着色器入口函数
    void main() {
        // 将三角形输出的最终颜色固定为玫红色
        // 这里的四个分量分别代表红（r）、绿（g）、蓝（b）和透明度（alpha）
        // 颜色数值取归一化值。最终绘制的其实就是 [255, 0, 127. 255]
        gl_FragColor = xx2_color;
    }`;
const positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
        0.7, 0.5,
];
const color = [
        255, 0, 0,255,
        0, 255, 0,255,
        0,0,255,255,
        128,128,0,255,
];
function initBuffer() {
    // |      X         |      Y        | r | g | b | a |
    // |    0 ~ 3 bytes |   4 ~ 7 bytes | 8 | 9 | 10| 11|
    let data = new ArrayBuffer(positions.length*Float32Array.BYTES_PER_ELEMENT + color.length);
    let positionBuffer = new Float32Array(data)
    let colorBuffer = new Uint8Array(data)
    let p = 0;
    for(let i=0; i< positions.length;i+=2){
        positionBuffer[p] = positions[i]
        positionBuffer[p+1] = positions[i+1]
        p += 3
    }
    p = 8
    for(let i=0; i<color.length;i+=4){
        colorBuffer[p] = color[i]
        colorBuffer[p+1] = color[i+1]
        colorBuffer[p+2] = color[i+2]
        colorBuffer[p+3] = color[i+3]
        p+=12
    }
    return data;
}
function main() {
    // *给html增加一个canvas并且获得该canvas的gl上下文
    let gl = initCanvasAndGetGL() 
    if (!gl) {
        console.log("error gl is null") 
        return;
    }

    // *设置视口尺寸，将视口和画布尺寸同步
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); 
    // *清除画布颜色，直接设置成透明色。此处是为了便于观察，将它设置成黑色。
    // 注意，渲染管线是每帧都会绘制内容，就好比每帧都在画板上画画，如果不清除的话，就有可能出现花屏现象
    // 清理颜色缓冲器, 通常会在每一帧渲染前使用，确保渲染前缓冲区干净
    // openGL 分为 前缓冲区(屏幕)，后缓冲区(内存), 然后前后进行交换, 也有其他模式
    gl.clearColor(0, 0, 0, 255);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // *通过文本绑定，编译着色器，返回着色器, 通过着色器，创建着色器程序，并且绑定两个着色器
    // 顶点着色器
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    // 片元着色器
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    // 创建着色器程序，并且绑定顶点着色器和片元着色器
    const program = createProgram(gl, vertexShader, fragmentShader);    


    // *创建共用参数buffer
    // 填充position和color到buffer中
    let data = initBuffer()
    // 1. 创建顶点缓冲对象
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 2. 将所有数据通过ArrayBuffer传入（数据以每个顶点的数据为循环的buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); 

    // 3. 将顶点着色器中变量/属性的id获取出来,并且启用这个属性
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);  
    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorAttributeLocation); 

    // 4. 通过: gl.vertexAttribPointer 标记第2步中数据每个顶点数据的偏移对应付给第3步中的属性
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 12, 0);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.UNSIGNED_BYTE, true, 12, 8); 

    // *使用顶点索引
    // 顶点索引
    const indices = [
        0, 1, 2, // 第一个三角形
        2, 1, 3  // 第二个三角形
    ];
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // *启用该shader的program，并且开始绘制
    gl.useProgram(program);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}
main()