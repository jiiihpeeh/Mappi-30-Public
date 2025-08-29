import { create } from 'zustand'

 

enum Orientation {
    Portrait = "portrait",
    Landscape = "landscape"
}

type Dimensions = {
    height: number,
    width: number
}

type UseWindow =  {
    dimensions: Dimensions,
    setDimensions: (d : Dimensions) => void,
    windowOrientation: Orientation,
    setWindowOrientation: (o: Orientation) => void,
    sideDrawerWidth: number,
    infoAreaWidth: number
    infoAreaHeight: number,
}

export const useWindowStore = create<UseWindow>((set) => (
    {
        dimensions: { height: document.documentElement.clientHeight, width: document.documentElement.clientWidth},
        setDimensions: (d:Dimensions) => {
            set({
               dimensions: {
                    height: d.height,
                    width: d.width 
                }
        })
        },
        windowOrientation:  window.matchMedia("(orientation: portrait)").matches ? Orientation.Portrait : Orientation.Landscape,
        setWindowOrientation: (o: Orientation) =>{
            set({
                windowOrientation: o
            })
        },
        sideDrawerWidth: 240,
        infoAreaWidth: 800,
        infoAreaHeight: 800,
    }
    
))

function updateDimensionsAndOrientation() {
    const dimensions = {
      height: document.documentElement.clientHeight,
      width: document.documentElement.clientWidth,
    }
    const areaWidth = 0.9*(dimensions.width - useWindowStore.getState().sideDrawerWidth)
    const orientation = window.matchMedia("(orientation: portrait)").matches
      ? Orientation.Portrait
      : Orientation.Landscape;
  
    useWindowStore.setState({
      dimensions: dimensions,
      windowOrientation: orientation,
      infoAreaWidth: areaWidth,
      infoAreaHeight: 0.85*dimensions.height
    })
}
updateDimensionsAndOrientation()
  
window.addEventListener("resize", updateDimensionsAndOrientation);
window.addEventListener("orientationchange", updateDimensionsAndOrientation)
  
export function cleanupWindowListeners() {
    window.removeEventListener("resize", updateDimensionsAndOrientation)
    window.removeEventListener("orientationchange", updateDimensionsAndOrientation)
}