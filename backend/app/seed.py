import json, asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

SEED_DIR = Path(__file__).parent.parent.parent / "data" / "seeds"

async def seed_mongo():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    for name in ["refineries", "suppliers", "chokepoints", "crude_grades"]:
        data = json.loads((SEED_DIR / f"{name}.json").read_text())
        await db[name].delete_many({})
        await db[name].insert_many(data)
        print(f"Seeded {len(data)} {name}")

def seed_neo4j():
    driver = GraphDatabase.driver(
        os.environ["NEO4J_URI"],
        auth=(os.environ["NEO4J_USER"], os.environ["NEO4J_PASS"])
    )
    suppliers = json.loads((SEED_DIR / "suppliers.json").read_text())
    refineries = json.loads((SEED_DIR / "refineries.json").read_text())
    grades = json.loads((SEED_DIR / "crude_grades.json").read_text())

    with driver.session() as s:
        s.run("MATCH (n) DETACH DELETE n")
        for sup in suppliers:
            s.run("""MERGE (c:Country {iso:$iso, name:$country})
                     MERGE (s:Supplier {name:$name, reliability:$rel, sanctioned:$sanc})
                     MERGE (s)-[:HOSTED_IN]->(c)""",
                  iso=sup["iso"], country=sup["country"], name=sup["name"],
                  rel=sup["reliability"], sanc=sup["sanctioned"])
        for r in refineries:
            s.run("MERGE (:Refinery {name:$name, capacity:$cap, api_min:$amin, api_max:$amax, sulfur_max:$smax})",
                  name=r["name"], cap=r["capacity_bpd"], amin=r["api_min"], amax=r["api_max"], smax=r["sulfur_max_pct"])
        for g in grades:
            s.run("""MATCH (s:Supplier {name:$sup})
                     MERGE (g:CrudeGrade {name:$name, api:$api, sulfur:$sul})
                     MERGE (s)-[:PRODUCES]->(g)""",
                  sup=g["supplier"], name=g["name"], api=g["api"], sul=g["sulfur_pct"])
    driver.close()
    print("Neo4j seeded")

async def main():
    await seed_mongo()
    seed_neo4j()

if __name__ == "__main__":
    asyncio.run(main())