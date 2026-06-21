import json


def load_json(file_path):
    """Return a dictionary read from a JSON file"""
    with open(file_path, 'r') as file:
        data = json.load(file)
    
    return data


def dump_json(file_path, data):
    """Dump content into a JSON file"""
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)