import "./index.less";
import * as THREE from "three";
import VRHall from "./vrhall";
// import VRHall from "./lib/vrhall.es";
import { data } from "./pictures2";
// import Zoomtastic from "zoomtastic";

// 因为模型所需，正常的gltf模型是不需要手动设置贴图的，这里是网上找的模型
import * as m from "./materls";

// 贴图图片地址
// ======================
// 贴图地址数组（Vite 格式）
// ======================
// const texUrls = [
//   new URL("./src/assets/texture-map/10.jpg", import.meta.url).href,
//   new URL("./src/assets/texture-map/11.jpg", import.meta.url).href,
//   new URL("./src/assets/texture-map/12.jpg", import.meta.url).href,
//   new URL("./src/assets/texture-map/13.jpg", import.meta.url).href,
//   new URL("./src/assets/texture-map/14.jpg", import.meta.url).href,
//   new URL("./src/assets/texture-map/15.jpg", import.meta.url).href,
//   new URL("./src/assets/texture-map/16.jpg", import.meta.url).href,
//   new URL("./src/assets/texture-map/17.jpg", import.meta.url).href,
//   new URL("./src/assets/texture-map/18.jpg", import.meta.url).href,
//   new URL("./src/assets/texture-map/19.jpg", import.meta.url).href,
// ];
const texUrls = [
  "./src/assets/texture-map/10.jpg",
  "./src/assets/texture-map/11.png",
  "./src/assets/texture-map/12.jpg",
  "./src/assets/texture-map/13.jpg",
  "./src/assets/texture-map/14.jpg",
  "./src/assets/texture-map/14.png",
  "./src/assets/texture-map/16.jpg",
  "./src/assets/texture-map/17.jpg",
  "./src/assets/texture-map/18.jpg",
  "./src/assets/texture-map/19.jpg",
];

// ======================
// 创建右侧模型属性面板
// ======================
function createModelAttrPanel() {
  const panel = document.createElement("div");
  panel.className = "right_model_attr";
  panel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 30px;
    z-index: 1000;
    background: #fff;
    padding: 12px 14px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    min-width: 180px;
  `;

  // 标题
  const title = document.createElement("div");
  title.innerText = "模型属性";
  title.style.cssText = "font-weight:bold;margin-bottom:10px;";
  panel.appendChild(title);

  // 颜色选择
  const colorLabel = document.createElement("div");
  colorLabel.innerText = "颜色：";
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = "#ffffff";
  colorInput.style.width = "100%";
  panel.appendChild(colorLabel);
  panel.appendChild(colorInput);

  // 贴图标题
  const texLabel = document.createElement("div");
  texLabel.innerText = "贴图：";
  texLabel.style.margin = "10px 0 6px";
  panel.appendChild(texLabel);

  // 贴图列表容器
  const texList = document.createElement("div");
  texList.style.cssText = `
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 200px;
    overflow-y: auto;
  `;
  panel.appendChild(texList);

  // 循环渲染贴图
  texUrls.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.style.cssText = `
      width: 40px;
      height: 40px;
      object-fit: cover;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    `;
    texList.appendChild(img);
  });

  document.body.appendChild(panel);
  return { panel, colorInput, texList };
}

// ========== 初始化面板 ==========
const { colorInput, texList } = createModelAttrPanel();

// ========== 全局变量：记录当前选中的模型 ==========
window.currentSelectedMesh = null;
// ======================
// 1. 颜色修改
// ======================
colorInput.addEventListener("input", (e) => {
  const mesh = window.currentSelectedMesh;
  if (!mesh) {
    console.log("请先点击选中模型！");
    return 
  };
  const color = e.target.value;

  mesh.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.color.set(color);
      child.material.needsUpdate = true;
    }
  });
});

// ======================
// 2. 点击贴图 → 应用到模型
// ======================
texList.addEventListener("click", (e) => {
  if (e.target.tagName !== "IMG") return;

  const mesh = window.currentSelectedMesh;
  if (!mesh) {
    console.log("请先点击选中模型！");
    return 
  };

  const imgUrl = e.target.src;
  const texture = new THREE.TextureLoader().load(imgUrl);

  mesh.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.map = texture;
      child.material.needsUpdate = true;
    }
  });
});


const loadModelFunc = (vr, modelIdName = "sofa", url = "./assets/gltfs/glb-8.glb") => {
    // 加载沙发模型
        vr.loadGLTF({
          url: url,
          position: {
            x: 19.655541400079763,
            y: 0.3955837972716467,
            z: 3.3849787954383963,
          },
          // autoLight: true,
          rotation: { x: 0, y: -Math.PI / 2, z: 0 },
          scale: 1.8,
        }).then((gltf) => {
          console.log("loaded sofa", gltf.scene);
          gltf.scene.odata = { id: modelIdName }; // 给沙发本身绑定数据
          vr.addClickEvent(gltf.scene); // 给沙发本身添加点击事件
          // 遍历沙发模型内部所有子物体, 每个子物体都能点击并单独移动
          // gltf.scene.traverse((child) => {
          //   if (child.isMesh) {
          //     child.odata = { id: "sofa" }; // 给子物体本身绑定数据
          //     vr.addClickEvent(child); // ✅ 子物体添加点击
          //   }
          // });

          // 调用动画
          vr.createAnimate(gltf, { animateIndex: 0, duration: 5 });
        });
}

// 创建左侧模型图标列表框
const genImgListDom = (vr) => {
  // 1. 创建容器 div.left_model_pic_list
  const leftModelList = document.createElement('div');
  leftModelList.className = 'left_model_pic_list';
  leftModelList.style.cssText = `
    position: fixed;
    top: 10px;
    left: 30px;
    z-index: 1000;
  `;

  // 2. 定义图片数据（路径 + 点击回调）
  const imageList = [
    {
      src: './src/assets/model-icon/shafa.png',
      alt: '沙发',
      onClick: () => {
        console.log('点击了沙发');
        // 在这里写沙发点击逻辑：加载沙发模型、跳转视角等
        // 例：vr.loadGLTF(沙发模型)
        loadModelFunc(vr, "sofa", "./assets/gltfs/glb-8.glb");
      }
    },
    {
      src: './src/assets/model-icon/car.png',
      alt: '汽车',
      onClick: () => {
        console.log('点击了汽车');
        // 在这里写汽车点击逻辑
        // 例：vr.loadGLTF(汽车模型)
        loadModelFunc(vr, "car", "./assets/gltfs/glb-7.glb");
      }
    }
  ];

  // 3. 循环创建图片项并添加点击事件
  imageList.forEach(item => {
    // 创建项容器
    const itemDiv = document.createElement('div');
    itemDiv.className = 'left_model_pic_list_item';
    itemDiv.style.cssText = `
      width: 100px;
      height: 100px;
      display: flex;
      margin-bottom: 10px;
      cursor: pointer;
    `;

    // 创建图片
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.width = 100;
    img.height = 100;

    // 绑定点击事件
    itemDiv.addEventListener('click', item.onClick);

    // 组装
    itemDiv.appendChild(img);
    leftModelList.appendChild(itemDiv);
  });

  // 4. 插入到 body 中（和你原来的位置一样）
  document.body.appendChild(leftModelList);
}


window.onload = function () {
  
  // 实例化
  const vr = new VRHall({
    debugger: !false, // 开启调试模式
    maxSize: 20, // 画框最大尺寸
    movieHight: 2, // 移动的高度
    container: document.getElementById("root"),
    cameraOption: {
      // position: { x: 16.928, y: 2, z: 0.699 },
      // lookAt: { x: 30.551, y: 2, z: 1.096 },
      position: { x: 0, y: 10, z: 10 },
      lookAt: { x: 0, y: 0, z: 0 },
    },
    onClick: (item) => {
      console.log("你点击了", item);
      // if (item.url) {
        // Zoomtastic.show(item.url);
      // }
      // alert(JSON.stringify(item, null, 2));
    },
  });
  
  // 生成图片列表
  genImgListDom(vr);
  
  // Zoomtastic.mount();

  // 加载厅模型
  vr.loadHall({
    url: "./assets/room2/dm.glb",
    planeName: "dm", // plane , meishu01
    // position: { x: 2, y: -0.2, z: 2 },
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    onProgress: (p) => {
      console.log("加载进度", p);
    },
  }).then((gltf) => {
    // 正常gltf模型无需设置这些参数，因为网上找的模型，直接拷贝过来的代码
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        // ...
      }

      // if (child.material) {
      //   child.material.emissiveMap = child.material.map;
      // }
    });
    
    const dm_OBJ = gltf.scene.getObjectByName("dm");
    dm_OBJ.material = m.dm_M;
    const dm2_OBJ = gltf.scene.getObjectByName("dm2");
    dm2_OBJ.material = m.wall_M;
    const qiang5_OBJ = gltf.scene.getObjectByName("qiang5");
    qiang5_OBJ.material = m.qiang5_M;
    const huaqiang1_OBJ = gltf.scene.getObjectByName("huaqiang1");
    huaqiang1_OBJ.material = m.huaqiang1_M;
    const huaqiang3_OBJ = gltf.scene.getObjectByName("huaqiang3");
    huaqiang3_OBJ.material = m.huaqiang3_M;
    const huaqiang2_OBJ = gltf.scene.getObjectByName("huaqiang2");
    huaqiang2_OBJ.material = m.huaqiang2_M;
    const qiang2_OBJ = gltf.scene.getObjectByName("qiang2");
    qiang2_OBJ.material = m.qiang2_M;
    const qiang3_OBJ = gltf.scene.getObjectByName("qiang3");
    qiang3_OBJ.material = m.qiang3_M;
    const qiang1_OBJ = gltf.scene.getObjectByName("qiang1");
    qiang1_OBJ.material = m.qiang1_M;
    const men2_OBJ = gltf.scene.getObjectByName("men2");
    men2_OBJ.material = m.men2_M;
    const chuanghu_OBJ = gltf.scene.getObjectByName("chuanghu");
    chuanghu_OBJ.material = m.chuanghu_M;
    const dingtiao_OBJ = gltf.scene.getObjectByName("dingtiao");
    dingtiao_OBJ.material = m.dingtiao_M;
    const dingbian_OBJ = gltf.scene.getObjectByName("dingbian");
    dingbian_OBJ.material = m.dingbian_M;
    const dizuo1_OBJ = gltf.scene.getObjectByName("dizuo1");
    dizuo1_OBJ.material = m.dizuo1_M;
    const qiang4_OBJ = gltf.scene.getObjectByName("qiang4");
    qiang4_OBJ.material = m.qiang4_M;
    const cebaiqiang_OBJ = gltf.scene.getObjectByName("cebaiqiang");
    cebaiqiang_OBJ.material = m.ding_M;
    const boli1_OBJ = gltf.scene.getObjectByName("boli1");
    boli1_OBJ.material = m.boli1_M;
    const dimian2_OBJ = gltf.scene.getObjectByName("dimian2");
    dimian2_OBJ.material = m.dimian2_M;
    const dimian3_OBJ = gltf.scene.getObjectByName("dimian3");
    dimian3_OBJ.material = m.dimian3_M;
    const deng_OBJ = gltf.scene.getObjectByName("deng");
    deng_OBJ.material = m.deng_M;
    const ding_OBJ = gltf.scene.getObjectByName("ding");
    ding_OBJ.material = m.ding_M;
    const baiding_OBJ = gltf.scene.getObjectByName("baiding");
    baiding_OBJ.material = m.baiding_M;

    // 自定义info
    const info3d = gltf.scene.getObjectByName("jianjieqiang");
    info3d.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: new THREE.TextureLoader().load("./assets/pictures2/main.jpg"),
      // depthFunc: 3,
    });
  });

  // 加载机器人
  // vr.loadGLTF({
  //   url: "./assets/robot/robot.glb",
  //   position: {
  //     x: 19.655541400079763,
  //     y: 0.3955837972716467,
  //     z: 3.3849787954383963,
  //   },
  //   // autoLight: true,
  //   rotation: { x: 0, y: -Math.PI / 2, z: 0 },
  //   scale: 0.4,
  // }).then((gltf) => {
  //   gltf.scene.odata = { id: "robot" };
  //   vr.addClickEvent(gltf.scene);
  //   // 调用动画
  //   vr.createAnimate(gltf, { animateIndex: 0, duration: 5 });
  // });

  // // 加载沙发模型
  // vr.loadGLTF({
  //   url: "./assets/gltfs/glb-8.glb",
  //   position: {
  //     x: 19.655541400079763,
  //     y: 0.3955837972716467,
  //     z: 3.3849787954383963,
  //   },
  //   // autoLight: true,
  //   rotation: { x: 0, y: -Math.PI / 2, z: 0 },
  //   scale: 1.8,
  // }).then((gltf) => {
  //   gltf.scene.odata = { id: "sofa" }; // 给沙发本身绑定数据
  //   vr.addClickEvent(gltf.scene); // 给沙发本身添加点击事件
  //   // 遍历沙发模型内部所有子物体, 每个子物体都能点击并单独移动
  //   // gltf.scene.traverse((child) => {
  //   //   if (child.isMesh) {
  //   //     child.odata = { id: "sofa" }; // 给子物体本身绑定数据
  //   //     vr.addClickEvent(child); // ✅ 子物体添加点击
  //   //   }
  //   // });

  //   // 调用动画
  //   vr.createAnimate(gltf, { animateIndex: 0, duration: 5 });
  // });

  // // 加载球模型
  // vr.loadGLTF({
  //   scale: 0.5,
  //   position: {
  //     x: 0.14009586306492472,
  //     y: 0.3955837972716467,
  //     z: 3.3849787954383963,
  //   },
  //   autoLight: true,
  //   url: `./assets/separate/sphere-bot-with-hydraulics_2_8_Baked_Animations.gltf`,
  // }).then((gltf) => {
  //   gltf.scene.odata = { id: "ball" };
  //   vr.addClickEvent(gltf.scene);
  //   // 调用动画
  //   vr.createAnimate(gltf, { animateIndex: 0, duration: 60 });
  // });

  // // 加载房模型
  // vr.loadGLTF({
  //   scale: 0.4,
  //   position: {
  //     x: -9.697628171904498,
  //     y: 1.6742415555214554,
  //     z: 3.343388656678843,
  //   },
  //   rotation: {
  //     x: -3.141592653589793,
  //     y: 0.03132610956215899,
  //     z: -3.141592653589793,
  //   },
  //   url: `./assets/gltfs/feichuan.glb`,
  //   autoLight: true,
  // }).then((gltf) => {
  //   gltf.scene.odata = { id: "man" };
  //   vr.addClickEvent(gltf.scene);
  //   vr.createAnimate(gltf, { animateIndex: 0, duration: 60 });
  // });

  // 加载画框数据
  vr.loadItems(data);

  // vr.initVRButton();

  // 导览点
  // let shtml = "";
  // data.forEach((d) => {
  //   shtml += `<li class="item" data-id="${d.id}">展品:${d.id}</li>`;
  // });
  // shtml += `<li class="gravity">重力感应</li>`;

  // document.querySelector(".view").innerHTML = shtml;

  // document.querySelector(".gravity").addEventListener("click", () => {
    // if (document.location.protocol === "https:") {
    //   vr.gravity.toggle();
    // } else {
    //   alert("需要开启https");
    // }
  // });

  // document.querySelectorAll(".item").forEach((target) => {
  //   target.addEventListener("click", () => {
  //     const id = target.dataset.id;
  //     vr.viewItem(id);
  //   });
  // });
};
