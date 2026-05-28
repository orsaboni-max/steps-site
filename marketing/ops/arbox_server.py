import os
import json
import httpx
from collections import Counter
from datetime import datetime, timedelta, date
from mcp.server.fastmcp import FastMCP

ARBOX_API_KEY = os.environ.get("ARBOX_API_KEY", "1033ce61-13f4-4fe7-a9cd-38833265a1cf")
ARBOX_BASE_URL = "https://api.arboxapp.com/index.php/api/v2"

BRANCHES = {
    "poleg": 18259,
    "karit_hasharon": 20593,
}
BRANCH_NAMES = {
    18259: "סניף פולג",
    20593: "סניף קרית השרון",
}
DEFAULT_BRANCH = "poleg"
LOCATION_ID = BRANCHES[DEFAULT_BRANCH]


def _resolve_branch(branch: str | None) -> int | None:
    """Resolve branch slug to locations_box_fk. None / 'all' means no filter."""
    if branch is None or branch == "" or branch == DEFAULT_BRANCH:
        return BRANCHES[DEFAULT_BRANCH]
    if branch == "all":
        return None
    if branch in BRANCHES:
        return BRANCHES[branch]
    try:
        return int(branch)
    except (ValueError, TypeError):
        raise ValueError(f"Unknown branch '{branch}'. Use 'poleg', 'karit_hasharon', or 'all'.")


def _filter_by_branch(records: list, loc_id: int | None) -> list:
    """Filter list of records by locations_box_fk. If loc_id is None, return as-is."""
    if loc_id is None:
        return records
    return [r for r in records if r.get("locations_box_fk") == loc_id]


def _filter_schedule_by_branch(entries: list, loc_id: int | None) -> list:
    """Schedule entries use a 'location' STRING field, not locations_box_fk. Filter by name."""
    if loc_id is None:
        return entries
    name = BRANCH_NAMES.get(loc_id)
    if not name:
        return entries
    return [e for e in entries if e.get("location") == name]

mcp = FastMCP("arbox")


def _headers():
    return {
        "apiKey": ARBOX_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


async def _get(path: str, params: dict | None = None) -> dict | list:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{ARBOX_BASE_URL}{path}",
            headers=_headers(),
            params=params,
        )
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, dict) and data.get("statusCode") == 401:
            raise RuntimeError(data["error"]["description"])
        if isinstance(data, dict) and "error" in data and "data" not in data:
            raise RuntimeError(data.get("error_body") or data["error"])
        return data


@mcp.tool()
async def search_member(phone: str) -> str:
    """Search for a gym member by phone number. Returns matching member details."""
    try:
        phone_clean = phone.strip().replace("-", "").replace(" ", "")
        users = await _get("/users")
        matches = [
            u for u in users
            if u.get("phone") and phone_clean in u["phone"].replace("-", "").replace(" ", "")
        ]
        if not matches:
            return f"No member found with phone {phone}"
        results = []
        for m in matches:
            results.append({
                "id": m["id"],
                "user_fk": m["user_fk"],
                "first_name": m.get("first_name", ""),
                "last_name": m.get("last_name", ""),
                "email": m.get("email", ""),
                "phone": m.get("phone", ""),
                "gender": m.get("gender", ""),
                "birthday": m.get("birthday"),
                "active": m.get("active"),
                "start": m.get("start"),
                "end": m.get("end"),
                "membership_type": m.get("membership_type_name"),
            })
        return json.dumps(results, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error searching member: {e}"


@mcp.tool()
async def get_memberships(user_id: str) -> str:
    """Get active memberships for a user. Pass the member 'id' from search_member."""
    try:
        user_id_int = int(user_id)
        all_memberships = await _get("/membership")
        user_memberships = [m for m in all_memberships if m.get("id") == user_id_int]
        if not user_memberships:
            return f"No active memberships found for user {user_id}"
        results = []
        for m in user_memberships:
            results.append({
                "id": m["id"],
                "first_name": m.get("first_name", ""),
                "last_name": m.get("last_name", ""),
                "phone": m.get("phone", ""),
                "membership_name": m.get("name"),
                "start": m.get("start"),
                "end": m.get("end"),
                "type": m.get("type"),
                "price": m.get("price"),
                "debt": m.get("debt"),
            })
        return json.dumps(results, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error getting memberships: {e}"


@mcp.tool()
async def get_schedule(date: str) -> str:
    """Get training schedule for a given date. Format: YYYY-MM-DD."""
    try:
        data = await _get("/schedule", params={"fromDate": date, "toDate": date})
        entries = data.get("data", []) if isinstance(data, dict) else data
        if not entries:
            return f"No classes scheduled for {date}"
        results = []
        for s in entries:
            coach = s.get("coach") or {}
            results.append({
                "id": s["id"],
                "name": s.get("name", ""),
                "date": s.get("date", ""),
                "start_time": s.get("startTime", ""),
                "end_time": s.get("endTime", ""),
                "coach": f"{coach.get('firstName', '')} {coach.get('lastName', '')}".strip(),
                "max_members": s.get("maxMembers"),
                "location": s.get("location", ""),
                "is_cancelled": s.get("isCancelled", False),
            })
        return json.dumps(results, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error getting schedule: {e}"


@mcp.tool()
async def get_bookings(user_id: str) -> str:
    """Get upcoming bookings for a user. Note: The Arbox management API does not expose a per-user bookings endpoint. This returns the user's membership info and active status instead."""
    try:
        user_id_int = int(user_id)
        # Get user info
        users = await _get("/users")
        user = next((u for u in users if u["id"] == user_id_int), None)
        if not user:
            return f"User {user_id} not found"
        # Get membership info
        all_memberships = await _get("/membership")
        user_memberships = [m for m in all_memberships if m.get("id") == user_id_int]
        return json.dumps({
            "user": {
                "id": user["id"],
                "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
                "phone": user.get("phone", ""),
                "active": user.get("active"),
            },
            "active_memberships": [
                {
                    "name": m.get("name"),
                    "start": m.get("start"),
                    "end": m.get("end"),
                }
                for m in user_memberships
            ],
            "note": "Per-user booking/registration data is not available via the Arbox management API. Use the Arbox app or dashboard to view individual bookings.",
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error getting bookings: {e}"


@mcp.tool()
async def check_bina_membership(phone: str) -> str:
    """Check if a member has an active Bina nutrition subscription by phone number."""
    try:
        phone_clean = phone.strip().replace("-", "").replace(" ", "")
        # Search user by phone
        users = await _get("/users")
        user = next(
            (u for u in users if u.get("phone") and phone_clean in u["phone"].replace("-", "").replace(" ", "")),
            None,
        )
        if not user:
            return json.dumps({"found": False, "message": f"No member found with phone {phone}"})
        # Check memberships
        all_memberships = await _get("/membership")
        user_memberships = [m for m in all_memberships if m.get("id") == user["id"]]
        bina_keywords = ["bina", "בינה", "תזונה", "nutrition"]
        bina_memberships = [
            m for m in user_memberships
            if m.get("name") and any(kw in m["name"].lower() for kw in bina_keywords)
        ]
        has_bina = len(bina_memberships) > 0
        return json.dumps({
            "found": True,
            "user_id": user["id"],
            "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
            "phone": user.get("phone", ""),
            "has_bina_membership": has_bina,
            "bina_memberships": [
                {"name": m.get("name"), "start": m.get("start"), "end": m.get("end")}
                for m in bina_memberships
            ] if bina_memberships else [],
            "all_membership_names": [m.get("name") for m in user_memberships],
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error checking Bina membership: {e}"


def _parse_date(s):
    if not s:
        return None
    try:
        return datetime.strptime(s[:10], "%Y-%m-%d").date()
    except Exception:
        return None


def _active(m, today):
    start = _parse_date(m.get("start"))
    end = _parse_date(m.get("end"))
    if not end:
        return False
    if end < today:
        return False
    if start and start > today:
        return False
    return True


@mcp.tool()
async def list_locations() -> str:
    """List all gym branches (locations) for this Arbox account."""
    try:
        data = await _get("/locations")
        return json.dumps(data, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def active_members_count(branch: str = DEFAULT_BRANCH) -> str:
    """Count active members at a branch. branch='poleg' (default), 'karit_hasharon', or 'all'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        memberships = _filter_by_branch(await _get("/membership"), loc)
        active = [m for m in memberships if _active(m, today)]
        unique_ids = {m["id"] for m in active}
        return json.dumps({
            "branch": branch,
            "active_memberships": len(active),
            "unique_active_members": len(unique_ids),
            "as_of": today.isoformat(),
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def revenue_summary(branch: str = DEFAULT_BRANCH) -> str:
    """Estimate revenue from active memberships (sum of prices). branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        memberships = _filter_by_branch(await _get("/membership"), loc)
        active = [m for m in memberships if _active(m, today)]
        total = sum(float(m.get("price") or 0) for m in active)
        debt = sum(float(m.get("debt") or 0) for m in active)
        return json.dumps({
            "branch": branch,
            "active_memberships": len(active),
            "total_active_price_ILS": round(total, 2),
            "total_outstanding_debt_ILS": round(debt, 2),
            "net_collected_estimate_ILS": round(total - debt, 2),
            "as_of": today.isoformat(),
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def memberships_expiring(days: int = 7, branch: str = DEFAULT_BRANCH) -> str:
    """List memberships expiring in the next N days (default 7). branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        cutoff = today + timedelta(days=int(days))
        memberships = _filter_by_branch(await _get("/membership"), loc)
        expiring = []
        for m in memberships:
            end = _parse_date(m.get("end"))
            if end and today <= end <= cutoff:
                expiring.append({
                    "id": m["id"],
                    "name": f"{m.get('first_name', '')} {m.get('last_name', '')}".strip(),
                    "phone": m.get("phone", ""),
                    "membership_name": m.get("name"),
                    "end": m.get("end"),
                    "days_left": (end - today).days,
                    "price": m.get("price"),
                    "debt": m.get("debt"),
                })
        expiring.sort(key=lambda x: x["days_left"])
        return json.dumps({
            "branch": branch,
            "window_days": days,
            "count": len(expiring),
            "memberships": expiring,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def members_in_debt(min_debt: float = 1.0, branch: str = DEFAULT_BRANCH) -> str:
    """List members with outstanding debt above min_debt (default 1 ILS). branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        memberships = _filter_by_branch(await _get("/membership"), loc)
        in_debt = []
        for m in memberships:
            debt = float(m.get("debt") or 0)
            if debt >= float(min_debt):
                in_debt.append({
                    "id": m["id"],
                    "name": f"{m.get('first_name', '')} {m.get('last_name', '')}".strip(),
                    "phone": m.get("phone", ""),
                    "membership_name": m.get("name"),
                    "end": m.get("end"),
                    "active": _active(m, today),
                    "price": m.get("price"),
                    "debt": debt,
                })
        in_debt.sort(key=lambda x: -x["debt"])
        return json.dumps({
            "branch": branch,
            "count": len(in_debt),
            "total_debt_ILS": round(sum(x["debt"] for x in in_debt), 2),
            "members": in_debt,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def new_members(days: int = 7, branch: str = DEFAULT_BRANCH) -> str:
    """List members whose membership started in the last N days (default 7). branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        cutoff = today - timedelta(days=int(days))
        memberships = _filter_by_branch(await _get("/membership"), loc)
        new = []
        for m in memberships:
            start = _parse_date(m.get("start"))
            if start and cutoff <= start <= today:
                new.append({
                    "id": m["id"],
                    "name": f"{m.get('first_name', '')} {m.get('last_name', '')}".strip(),
                    "phone": m.get("phone", ""),
                    "membership_name": m.get("name"),
                    "start": m.get("start"),
                    "days_ago": (today - start).days,
                })
        new.sort(key=lambda x: x["days_ago"])
        return json.dumps({
            "branch": branch,
            "window_days": days,
            "count": len(new),
            "members": new,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def birthdays_this_week(branch: str = DEFAULT_BRANCH) -> str:
    """List members with a birthday in the next 7 days. branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        users = _filter_by_branch(await _get("/users"), loc)
        upcoming = []
        for u in users:
            bd_raw = u.get("birthday")
            bd = _parse_date(bd_raw)
            if not bd:
                continue
            this_year_bd = bd.replace(year=today.year)
            if this_year_bd < today:
                this_year_bd = bd.replace(year=today.year + 1)
            days_until = (this_year_bd - today).days
            if 0 <= days_until <= 7:
                upcoming.append({
                    "id": u["id"],
                    "name": f"{u.get('first_name', '')} {u.get('last_name', '')}".strip(),
                    "phone": u.get("phone", ""),
                    "birthday": bd_raw,
                    "days_until": days_until,
                    "turning": today.year - bd.year if this_year_bd.year == today.year else (today.year + 1) - bd.year,
                })
        upcoming.sort(key=lambda x: x["days_until"])
        return json.dumps({
            "branch": branch,
            "count": len(upcoming),
            "members": upcoming,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def membership_breakdown(branch: str = DEFAULT_BRANCH) -> str:
    """Group active memberships by type/name. Shows what's selling. branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        memberships = _filter_by_branch(await _get("/membership"), loc)
        active = [m for m in memberships if _active(m, today)]
        by_name = {}
        for m in active:
            name = m.get("name") or "Unknown"
            by_name.setdefault(name, {"count": 0, "revenue": 0.0, "debt": 0.0})
            by_name[name]["count"] += 1
            by_name[name]["revenue"] += float(m.get("price") or 0)
            by_name[name]["debt"] += float(m.get("debt") or 0)
        ranked = sorted(
            [{"name": n, **v, "revenue": round(v["revenue"], 2), "debt": round(v["debt"], 2)}
             for n, v in by_name.items()],
            key=lambda x: -x["count"],
        )
        return json.dumps({
            "branch": branch,
            "total_active": len(active),
            "by_type": ranked,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def coach_workload(date_from: str, date_to: str, branch: str = DEFAULT_BRANCH) -> str:
    """Count classes per coach between date_from and date_to (YYYY-MM-DD). branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        data = await _get("/schedule", params={"fromDate": date_from, "toDate": date_to})
        entries = data.get("data", []) if isinstance(data, dict) else data
        entries = _filter_schedule_by_branch(entries, loc)
        counter = Counter()
        for s in entries:
            coach = s.get("coach") or {}
            name = f"{coach.get('firstName', '')} {coach.get('lastName', '')}".strip() or "Unknown"
            counter[name] += 1
        return json.dumps({
            "branch": branch,
            "from": date_from,
            "to": date_to,
            "total_classes": sum(counter.values()),
            "by_coach": [{"coach": c, "classes": n} for c, n in counter.most_common()],
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def class_distribution(date_from: str, date_to: str, branch: str = DEFAULT_BRANCH) -> str:
    """Group classes by class name between date_from and date_to (YYYY-MM-DD). branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        data = await _get("/schedule", params={"fromDate": date_from, "toDate": date_to})
        entries = data.get("data", []) if isinstance(data, dict) else data
        entries = _filter_schedule_by_branch(entries, loc)
        counter = Counter()
        for s in entries:
            counter[s.get("name") or "Unknown"] += 1
        return json.dumps({
            "branch": branch,
            "from": date_from,
            "to": date_to,
            "total_classes": sum(counter.values()),
            "by_type": [{"class": c, "count": n} for c, n in counter.most_common()],
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def weekly_schedule_summary(start_date: str, branch: str = DEFAULT_BRANCH) -> str:
    """Full weekly view starting at start_date (YYYY-MM-DD). 7 days grouped by day. branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = start + timedelta(days=6)
        data = await _get("/schedule", params={"fromDate": start.isoformat(), "toDate": end.isoformat()})
        entries = data.get("data", []) if isinstance(data, dict) else data
        entries = _filter_schedule_by_branch(entries, loc)
        by_day = {}
        for s in entries:
            d = s.get("date", "")[:10]
            by_day.setdefault(d, []).append({
                "time": s.get("startTime", "")[:5],
                "name": s.get("name"),
                "coach": f"{(s.get('coach') or {}).get('firstName', '')} {(s.get('coach') or {}).get('lastName', '')}".strip(),
                "max": s.get("maxMembers"),
            })
        for d in by_day:
            by_day[d].sort(key=lambda x: x["time"])
        return json.dumps({
            "branch": branch,
            "from": start.isoformat(),
            "to": end.isoformat(),
            "total_classes": len(entries),
            "by_day": dict(sorted(by_day.items())),
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def daily_summary(target_date: str | None = None, branch: str = DEFAULT_BRANCH) -> str:
    """One-shot daily snapshot: classes today, new members, expiring, debts, birthdays. branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = datetime.strptime(target_date, "%Y-%m-%d").date() if target_date else date.today()

        schedule_data = await _get("/schedule", params={"fromDate": today.isoformat(), "toDate": today.isoformat()})
        classes = schedule_data.get("data", []) if isinstance(schedule_data, dict) else schedule_data
        classes = _filter_schedule_by_branch(classes, loc)

        memberships = _filter_by_branch(await _get("/membership"), loc)
        active = [m for m in memberships if _active(m, today)]
        expiring_7d = [m for m in memberships if _parse_date(m.get("end")) and today <= _parse_date(m["end"]) <= today + timedelta(days=7)]
        new_7d = [m for m in memberships if _parse_date(m.get("start")) and today - timedelta(days=7) <= _parse_date(m["start"]) <= today]
        in_debt = [m for m in memberships if float(m.get("debt") or 0) >= 1]

        users = _filter_by_branch(await _get("/users"), loc)
        bdays = []
        for u in users:
            bd = _parse_date(u.get("birthday"))
            if not bd:
                continue
            this_year_bd = bd.replace(year=today.year)
            if this_year_bd < today:
                this_year_bd = bd.replace(year=today.year + 1)
            if 0 <= (this_year_bd - today).days <= 7:
                bdays.append(u)

        coach_counter = Counter()
        for s in classes:
            c = s.get("coach") or {}
            name = f"{c.get('firstName', '')} {c.get('lastName', '')}".strip() or "Unknown"
            coach_counter[name] += 1

        return json.dumps({
            "branch": branch,
            "date": today.isoformat(),
            "classes_today": {
                "total": len(classes),
                "by_coach": [{"coach": c, "classes": n} for c, n in coach_counter.most_common()],
            },
            "active_members": len(active),
            "new_this_week": len(new_7d),
            "expiring_next_7d": len(expiring_7d),
            "members_in_debt": len(in_debt),
            "total_outstanding_debt_ILS": round(sum(float(m.get("debt") or 0) for m in in_debt), 2),
            "birthdays_this_week": len(bdays),
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def member_full_profile(phone: str) -> str:
    """360° view of a member: user info + all memberships + active flag + Bina status. Pass phone number."""
    try:
        phone_clean = phone.strip().replace("-", "").replace(" ", "")
        today = date.today()
        users = await _get("/users")
        user = next(
            (u for u in users if u.get("phone") and phone_clean in u["phone"].replace("-", "").replace(" ", "")),
            None,
        )
        if not user:
            return json.dumps({"found": False, "phone": phone}, ensure_ascii=False)

        memberships = await _get("/membership")
        user_mems = [m for m in memberships if m.get("id") == user["id"]]
        has_bina = any(
            m.get("name") and any(kw in m["name"].lower() for kw in ["bina", "בינה", "תזונה", "nutrition"])
            for m in user_mems
        )
        return json.dumps({
            "found": True,
            "id": user["id"],
            "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
            "phone": user.get("phone", ""),
            "email": user.get("email", ""),
            "gender": user.get("gender", ""),
            "birthday": user.get("birthday"),
            "active": user.get("active"),
            "branch": BRANCH_NAMES.get(user.get("locations_box_fk"), str(user.get("locations_box_fk"))),
            "has_bina": has_bina,
            "memberships": [
                {
                    "name": m.get("name"),
                    "start": m.get("start"),
                    "end": m.get("end"),
                    "price": m.get("price"),
                    "debt": m.get("debt"),
                    "currently_active": _active(m, today),
                }
                for m in user_mems
            ],
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def bina_eligible_non_buyers(branch: str = DEFAULT_BRANCH) -> str:
    """Active members who have NOT purchased a Bina nutrition membership. Marketing target. branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        memberships = _filter_by_branch(await _get("/membership"), loc)
        active = [m for m in memberships if _active(m, today)]

        by_user = {}
        for m in active:
            uid = m["id"]
            by_user.setdefault(uid, {
                "id": uid,
                "name": f"{m.get('first_name', '')} {m.get('last_name', '')}".strip(),
                "phone": m.get("phone", ""),
                "memberships": [],
                "has_bina": False,
            })
            by_user[uid]["memberships"].append(m.get("name"))
            if m.get("name") and any(kw in m["name"].lower() for kw in ["bina", "בינה", "תזונה", "nutrition"]):
                by_user[uid]["has_bina"] = True

        non_buyers = [u for u in by_user.values() if not u["has_bina"]]
        return json.dumps({
            "branch": branch,
            "total_active_members": len(by_user),
            "without_bina": len(non_buyers),
            "with_bina": len(by_user) - len(non_buyers),
            "members": non_buyers,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


def _group_memberships_by_user(memberships: list) -> dict:
    """Group all memberships by user_fk (the actual user/customer reference).

    CRITICAL: m['id'] is the membership row ID, NOT the user ID.
    The field that links a membership to a customer is 'user_fk'.
    """
    by_user = {}
    for m in memberships:
        uid = m.get("user_fk")
        if not uid:
            continue
        if uid not in by_user:
            by_user[uid] = {
                "user_fk": uid,
                "name": f"{m.get('first_name', '')} {m.get('last_name', '')}".strip(),
                "phone": m.get("phone", ""),
                "memberships": [],
            }
        by_user[uid]["memberships"].append(m)
    # Sort each user's memberships by start date
    for uid, info in by_user.items():
        info["memberships"].sort(key=lambda x: _parse_date(x.get("start")) or date(1900, 1, 1))
    return by_user


@mcp.tool()
async def truly_new_customers(days: int = 7, branch: str = DEFAULT_BRANCH) -> str:
    """List customers whose FIRST EVER membership started in the last N days.

    Excludes renewals, upgrades, and returning customers. This is the real
    "new customer acquisition" metric for marketing attribution.
    branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        cutoff = today - timedelta(days=int(days))
        memberships = _filter_by_branch(await _get("/membership"), loc)
        by_user = _group_memberships_by_user(memberships)

        truly_new = []
        for uid, info in by_user.items():
            if not info["memberships"]:
                continue
            first = info["memberships"][0]
            first_start = _parse_date(first.get("start"))
            if first_start and cutoff <= first_start <= today:
                truly_new.append({
                    "id": uid,
                    "name": info["name"],
                    "phone": info["phone"],
                    "first_membership": first.get("name"),
                    "first_start": first.get("start"),
                    "first_price_ILS": float(first.get("price") or 0),
                    "days_ago": (today - first_start).days,
                    "total_memberships": len(info["memberships"]),
                })
        truly_new.sort(key=lambda x: x["days_ago"])
        return json.dumps({
            "branch": branch,
            "window_days": days,
            "count": len(truly_new),
            "definition": "Users whose first-ever membership started within window. Excludes renewals/upgrades/returning.",
            "customers": truly_new,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def renewals(days: int = 7, branch: str = DEFAULT_BRANCH) -> str:
    """List membership renewals in the last N days.

    A renewal = a membership starting in the window for a user who already
    had at least one prior membership. branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        cutoff = today - timedelta(days=int(days))
        memberships = _filter_by_branch(await _get("/membership"), loc)
        by_user = _group_memberships_by_user(memberships)

        renewal_list = []
        for uid, info in by_user.items():
            mems = info["memberships"]
            if len(mems) < 2:
                continue
            # Find any membership in the window that is NOT the user's first
            for i, m in enumerate(mems):
                if i == 0:
                    continue
                start = _parse_date(m.get("start"))
                if start and cutoff <= start <= today:
                    prev = mems[i - 1]
                    prev_end = _parse_date(prev.get("end"))
                    gap_days = (start - prev_end).days if prev_end else None
                    renewal_list.append({
                        "id": uid,
                        "name": info["name"],
                        "phone": info["phone"],
                        "renewed_to": m.get("name"),
                        "renewal_start": m.get("start"),
                        "previous_membership": prev.get("name"),
                        "previous_end": prev.get("end"),
                        "gap_days": gap_days,
                        "is_returning_after_break": gap_days is not None and gap_days > 30,
                        "days_ago": (today - start).days,
                    })
                    break  # only count one renewal per user per window
        renewal_list.sort(key=lambda x: x["days_ago"])
        returning = [r for r in renewal_list if r["is_returning_after_break"]]
        return json.dumps({
            "branch": branch,
            "window_days": days,
            "total_renewals": len(renewal_list),
            "of_which_returning_after_break": len(returning),
            "of_which_continuous_renewals": len(renewal_list) - len(returning),
            "renewals": renewal_list,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def acquisition_summary(days: int = 30, branch: str = DEFAULT_BRANCH) -> str:
    """Marketing-grade acquisition report: breakdown of new memberships in window.

    Splits memberships started in window into:
    - truly_new: first-ever customer
    - renewal_continuous: prior membership ended <=30 days before new one
    - renewal_returning: prior membership ended >30 days ago (came back)

    branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        cutoff = today - timedelta(days=int(days))
        memberships = _filter_by_branch(await _get("/membership"), loc)
        by_user = _group_memberships_by_user(memberships)

        truly_new = []
        renewal_continuous = []
        renewal_returning = []

        for uid, info in by_user.items():
            mems = info["memberships"]
            # Find any membership in window
            for i, m in enumerate(mems):
                start = _parse_date(m.get("start"))
                if not (start and cutoff <= start <= today):
                    continue
                entry = {
                    "id": uid,
                    "name": info["name"],
                    "phone": info["phone"],
                    "membership": m.get("name"),
                    "start": m.get("start"),
                    "price_ILS": float(m.get("price") or 0),
                    "days_ago": (today - start).days,
                }
                if i == 0:
                    truly_new.append(entry)
                else:
                    prev_end = _parse_date(mems[i - 1].get("end"))
                    gap = (start - prev_end).days if prev_end else None
                    entry["gap_days"] = gap
                    if gap is not None and gap > 30:
                        renewal_returning.append(entry)
                    else:
                        renewal_continuous.append(entry)
                break

        return json.dumps({
            "branch": branch,
            "window_days": days,
            "summary": {
                "total_memberships_started": len(truly_new) + len(renewal_continuous) + len(renewal_returning),
                "truly_new_customers": len(truly_new),
                "renewal_continuous": len(renewal_continuous),
                "renewal_returning_after_break": len(renewal_returning),
            },
            "truly_new": truly_new,
            "renewals_continuous": renewal_continuous,
            "renewals_returning": renewal_returning,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def leads_summary(days: int = 30, branch: str = DEFAULT_BRANCH) -> str:
    """Marketing attribution: lead funnel from /leads endpoint.

    Reports leads created in window, breakdown by lead_source, conversion rate
    (lead -> paying customer = user_fk set + membership purchased).
    branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        today = date.today()
        cutoff_dt = datetime.now() - timedelta(days=int(days))
        cutoff = cutoff_dt.date()

        leads = await _get("/leads")
        leads = _filter_by_branch(leads, loc)

        def _parse_created(s):
            if not s:
                return None
            try:
                return datetime.strptime(s[:10], "%Y-%m-%d").date()
            except Exception:
                return None

        leads_in_window = []
        for ld in leads:
            cdt = _parse_created(ld.get("created_at"))
            if cdt and cutoff <= cdt <= today:
                leads_in_window.append(ld)

        # Group by source
        by_source = {}
        by_status = {}
        converted_user_fks = set()
        for ld in leads_in_window:
            src = ld.get("lead_source") or "unknown"
            status = ld.get("lead_status") or "unknown"
            by_source.setdefault(src, {"count": 0, "converted": 0})
            by_source[src]["count"] += 1
            by_status[status] = by_status.get(status, 0) + 1
            ufk = ld.get("user_fk")
            if ufk:
                by_source[src]["converted"] += 1
                converted_user_fks.add(ufk)

        # Compute conversion rate per source
        for src, info in by_source.items():
            info["conversion_rate_pct"] = round(
                100.0 * info["converted"] / info["count"], 1
            ) if info["count"] else 0.0

        # Cross-reference converted leads to actual memberships purchased
        memberships = _filter_by_branch(await _get("/membership"), loc)
        converted_with_membership = []
        for ld in leads_in_window:
            ufk = ld.get("user_fk")
            if not ufk:
                continue
            user_mems = [m for m in memberships if m.get("user_fk") == ufk]
            if user_mems:
                user_mems.sort(key=lambda x: _parse_date(x.get("start")) or date(1900, 1, 1))
                first_after_lead = next(
                    (m for m in user_mems if _parse_date(m.get("start")) and _parse_date(m.get("start")) >= _parse_created(ld.get("created_at"))),
                    None,
                )
                if first_after_lead:
                    converted_with_membership.append({
                        "lead_id": ld.get("id"),
                        "name": ld.get("full_name") or f"{ld.get('first_name', '')} {ld.get('last_name', '')}".strip(),
                        "phone": ld.get("phone"),
                        "lead_source": ld.get("lead_source"),
                        "lead_status": ld.get("lead_status"),
                        "lead_created_at": ld.get("created_at"),
                        "membership_purchased": first_after_lead.get("name"),
                        "membership_start": first_after_lead.get("start"),
                        "price_ILS": float(first_after_lead.get("price") or 0),
                    })

        total_revenue = sum(float(c.get("price_ILS") or 0) for c in converted_with_membership)
        return json.dumps({
            "branch": branch,
            "window_days": days,
            "summary": {
                "total_leads": len(leads_in_window),
                "leads_with_user_fk_converted": len([l for l in leads_in_window if l.get("user_fk")]),
                "leads_that_actually_bought": len(converted_with_membership),
                "overall_conversion_rate_pct": round(100.0 * len(converted_with_membership) / len(leads_in_window), 1) if leads_in_window else 0,
                "total_revenue_from_converted_leads_ILS": total_revenue,
            },
            "by_lead_source": by_source,
            "by_lead_status": by_status,
            "converted_customers": converted_with_membership,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
async def inspect_membership_fields(branch: str = DEFAULT_BRANCH) -> str:
    """DIAGNOSTIC: returns all field keys present in membership records AND user records,
    AND probes candidate Arbox endpoints for membership history / cancellations.

    Discovers cancellation/trial/status/creation fields not yet exposed by other tools.
    branch defaults to 'poleg'."""
    try:
        loc = _resolve_branch(branch)
        memberships = _filter_by_branch(await _get("/membership"), loc)
        users = await _get("/users")
        if not memberships:
            return json.dumps({"error": "no memberships returned"}, ensure_ascii=False)

        # MEMBERSHIP fields
        mem_keys = set()
        for m in memberships:
            mem_keys.update(m.keys())
        mem_signal_keys = [k for k in mem_keys if any(
            t in k.lower() for t in ["cancel", "trial", "status", "froze", "freeze", "active", "type", "lead", "source", "created", "create"]
        )]
        mem_signal_values = {}
        for k in mem_signal_keys:
            vals = {str(m.get(k)) for m in memberships}
            mem_signal_values[k] = sorted(list(vals))[:20]
        trial_names = sorted({
            m.get("name", "") for m in memberships
            if m.get("name") and any(t in m["name"] for t in ["היכרות", "ניסיון", "trial", "Trial"])
        })

        # USER fields
        user_keys = set()
        for u in users:
            user_keys.update(u.keys())
        user_signal_keys = [k for k in user_keys if any(
            t in k.lower() for t in ["create", "register", "joined", "since", "first", "open", "sign", "active", "status"]
        )]
        user_signal_values = {}
        for k in user_signal_keys:
            vals = [str(u.get(k)) for u in users[:3]]
            user_signal_values[k] = vals

        # PROBE candidate endpoints for cancellation / history data
        endpoint_probe = {}
        candidates = [
            "/users/history", "/membership/history", "/memberships",
            "/user_history", "/membership_history", "/cancellations",
            "/clients", "/members", "/leads",
            "/trial", "/trials",
            "/payments", "/transactions",
        ]
        async with httpx.AsyncClient(timeout=10) as client:
            for path in candidates:
                try:
                    resp = await client.get(f"{ARBOX_BASE_URL}{path}", headers=_headers())
                    if resp.status_code == 200:
                        data = resp.json()
                        if isinstance(data, list) and data and isinstance(data[0], dict):
                            endpoint_probe[path] = {"status": 200, "count": len(data), "fields": sorted(list(data[0].keys()))[:25]}
                        elif isinstance(data, dict):
                            endpoint_probe[path] = {"status": 200, "type": "dict", "fields": sorted(list(data.keys()))[:25]}
                        else:
                            endpoint_probe[path] = {"status": 200, "shape": str(type(data).__name__)}
                    else:
                        endpoint_probe[path] = {"status": resp.status_code}
                except Exception as e:
                    endpoint_probe[path] = {"error": str(e)[:80]}

        return json.dumps({
            "membership": {
                "total_records": len(memberships),
                "all_field_keys": sorted(list(mem_keys)),
                "signal_keys_found": mem_signal_keys,
                "signal_values_sample": mem_signal_values,
                "trial_like_membership_names": trial_names,
            },
            "users": {
                "total_records": len(users),
                "all_field_keys": sorted(list(user_keys)),
                "signal_keys_found": user_signal_keys,
                "first_3_users_signal_values": user_signal_values,
            },
            "endpoint_probe": endpoint_probe,
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error: {e}"


if __name__ == "__main__":
    mcp.run()
