import { Component } from '@angular/core';

@Component({
  selector: 'app-rotator',
  templateUrl: './rotator.component.html',
  styleUrls: ['./rotator.component.css']
})
export class Rotator {
  angle: number = 90;

  rotateEvent() {
    let img: any = document.getElementById("image");
    const { width: W, height: H } = img
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    let imageData = context.getImageData(0, 0, img.width, img.height);
    console.log("image loaded...", imageData);
    let rotated = this.rotate(imageData, this.angle);
    //let rotated = this.rotateAngle(imageData, this.angle);
    canvas.width = H
    canvas.height = W
    context.clearRect(0, 0, W, H)
    context.putImageData(rotated, 0, 0, 0, 0, H, W)
    img.src = canvas.toDataURL('image/jpeg', 1)
  }

  rotate(imageData: ImageData, angle: number): ImageData {
    let direction = angle < 0 ? 'l' : 'r';
    // 1. Prepare ImageData
    // ctx.drawImage(img, 0, 0)
    let imgDt0: ImageData = imageData;//ctx.getImageData(0, 0, W, H);
    let imgDt1: ImageData = new ImageData(imageData.height, imageData.width);
    let imgDt2: ImageData = new ImageData(imageData.height, imageData.width);
    let dt0 = imgDt0.data
    let dt1 = imgDt1.data
    let dt2 = imgDt2.data
    // 2. Transpose
    let r = 0, r1 = 0  // index of red pixel in old and new ImageData, respectively
    for (let y = 0, lenH = imageData.height; y < lenH; y++) {
      for (let x = 0, lenW = imageData.width; x < lenW; x++) {
        r = (x + lenW * y) * 4
        r1 = (y + lenH * x) * 4
        dt1[r1 + 0] = dt0[r + 0]
        dt1[r1 + 1] = dt0[r + 1]
        dt1[r1 + 2] = dt0[r + 2]
        dt1[r1 + 3] = dt0[r + 3]
      }
    }

    // 3. Reverse width / height
    for (let y = 0, lenH = imageData.width; y < lenH; y++) {
      for (let x = 0, lenW = imageData.height; x < lenW; x++) {
        r = (x + lenW * y) * 4
        r1 = direction === 'l'
          ? (x + lenW * (lenH - 1 - y)) * 4
          : ((lenW - 1 - x) + lenW * y) * 4
        dt2[r1 + 0] = dt1[r + 0]
        dt2[r1 + 1] = dt1[r + 1]
        dt2[r1 + 2] = dt1[r + 2]
        dt2[r1 + 3] = dt1[r + 3]
      }
    }
    return imgDt2;
  }

  rotateAngle(imageData: ImageData, angle: number): ImageData {
    
    let w = imageData.width;
    let h = imageData.height;
    let sinAngle = Math.sin(Math.PI * angle / 180.0);
    let cosAngle = Math.cos(Math.PI * angle / 180.0);
    let M = [cosAngle, -sinAngle, sinAngle, cosAngle];
    let newHeightRaw, newWidthRaw;
    ////Find the new dimensions of the rotated image.
    if (Math.abs(angle) <= 90) {
      newHeightRaw = w * sinAngle + h * cosAngle;
      newWidthRaw = w * cosAngle + h * sinAngle;
    }
    else if (Math.abs(angle) <= 180) {
      newHeightRaw = w * Math.sin(Math.PI * (180 - angle) / 180.0) + h * Math.sin(Math.PI * (angle - 90) / 180);
      newWidthRaw = w * Math.cos(Math.PI * (180 - angle) / 180.0) + h * Math.cos(Math.PI * (angle - 90) / 180);
    }
    console.log("newHeightRaw : ", newHeightRaw, "newWidthRaw : ", newWidthRaw);
    ////Done with finding the new dimensions

    let newWidth = Math.round(newWidthRaw);
    let newHeight = Math.round(newHeightRaw);
    console.log("newWidth : ", newWidth, "newHeight : ", newHeight)
    let rotatedImageData:ImageData = new ImageData(newWidth,newHeight);
    let dt = rotatedImageData.data;

    for (let x = 0; x < newHeight; x++) {
      for (let y = 0; y < newWidth; y++) {
        ////Transform the coordinates to be centered at the center of the image
        let xt = x - (newHeightRaw - 1) / 2.0;
        let yt = y - (newWidthRaw - 1) / 2.0;
        
        let originalX = xt * cosAngle - yt * sinAngle + imageData.height / 2;
        let originalY = xt * sinAngle + yt * cosAngle + imageData.width / 2;

        
        let fractionX = Math.abs(originalX - Math.round(originalX));
        let fractionY = Math.abs(originalY - Math.round(originalY));
        
        ////Find the neighbors of the pixel in the original image
       // type Point = Array<{ x: number, y: number, weight: number }>;
        const neighbors: any = [{ x: Math.round(originalX), y: Math.round(originalY), weight: (1 - fractionX) * (1 - fractionY) },
        { x: Math.round(originalX), y: Math.round(originalY) + 1, weight: fractionX * (1 - fractionY) },
        { x: Math.round(originalX) + 1, y: Math.round(originalY), weight: (1 - fractionX) * fractionY },
        { x: Math.round(originalX) + 1, y: Math.round(originalY) + 1, weight: fractionX * fractionY }
        ];
        
        let hasData: Boolean = false;
        let newData:number = 0;
        let weight = 0;
        for (let i = 0; i < neighbors.length; i++) {
          // console.log("Neighbor : ",neighbors[i]);
          if (neighbors[i].x >= 0 && neighbors[i].x < imageData.height
            && neighbors[i].y >= 0 && neighbors[i].y < imageData.width
            && (neighbors[i].x) * imageData.width + neighbors[i].y < dt.length)
            {
            hasData = true;
            newData += neighbors[i].weight * imageData.data[(neighbors[i].x) * imageData.width + neighbors[i].y];
            weight += neighbors[i].weight;
           
          }
        }
        if (hasData && weight != 0) {
         // console.log("newData : ", newData);
          newData /= weight;
          dt[x * newWidth + y] = newData;
        }
      }
   
  }
  return rotatedImageData;
  }
}
