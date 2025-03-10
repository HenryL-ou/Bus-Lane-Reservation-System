import requests

def get_coordinates(address, city, api_key):
    url = "https://restapi.amap.com/v3/geocode/geo"
    params = {
        "key": api_key,
        "address": address,
        "city": city
    }
    response = requests.get(url, params=params).json()
    if response["status"] == "1" and len(response["geocodes"]) > 0:
        return response["geocodes"][0]["location"]  # 返回经纬度字符串（GCJ-02）
    else:
        return None

# 示例：获取天府广场经纬度
api_key = "643e933a51cf18de5ee5e5276d3e1126"
coordinates = get_coordinates("锦绣大道锦华路口站(公交站)", "成都", api_key)
print(coordinates)  # 输出：104.065735,30.657347