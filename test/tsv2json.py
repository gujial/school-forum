import pandas as pd

df = pd.read_csv("test/result.tsv", sep="\t", comment="#")
# 只取时间和响应时间
data = df[["seconds", "ttime"]].to_dict(orient="records")

import json
with open("test/result.json", "w") as f:
    json.dump(data, f)