
import * as fileUtils from "./fileUtils.js"

export default class ResLoader
{
    static load(loadList, onLoadedCallBack)
    {
        let loadedList = [];
        
        for (let i = 0; i < loadList.length; ++i)
        {
            switch (loadList[i].type)
            {
                case "text":
                    fileUtils.loadTextResource(loadList[i].path, function (err, text) 
                        {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            if (loadedList.push([ loadList[i].name, text ]) == loadList.length)
                                onLoadedCallBack(loadedList);
                        }
                    );
                    break;
                case "img":
                    fileUtils.loadImageResource(loadList[i].path, function (err, img) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        if (loadedList.push([ loadList[i].name, img ]) == loadList.length)
                            onLoadedCallBack(loadedList);
                    }
                    );
                    break;
                case "json":
                    fileUtils.loadJSONResource(loadList[i].path, function (err, data) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        if (loadedList.push([ loadList[i].name, data ]) == loadList.length)
                            onLoadedCallBack(loadedList);
                    }
                    );
                    break;
            }
        }
    }
};