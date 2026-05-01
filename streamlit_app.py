import streamlit as st
import json
import os
from datetime import datetime
import pandas as pd

# --- CONFIGURATION & CONSTANTS ---
DB_FILE = "chores_db.json"

# Try to get password from Streamlit Secrets first, then Env, then default
if "PARENT_PASSWORD" in st.secrets:
    PARENT_PASSWORD = st.secrets["PARENT_PASSWORD"]
else:
    PARENT_PASSWORD = os.getenv("PARENT_PASSWORD", "admin123")

USERS = ["Jernick", "Bave"]
CHORE_VALUES = {
    "Taking out the trash": 1,
    "Laundry": 2,
    "Cleaning the floor": 3,
    "Cleaning dishes": 3
}

# --- DATA PERSISTENCE ---
def load_data():
    if not os.path.exists(DB_FILE):
        return []
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def save_data(logs):
    with open(DB_FILE, "w") as f:
        json.dump(logs, f, indent=4)

# --- APP SETUP ---
st.set_page_config(page_title="Chore Tracker", page_icon="🏆", layout="wide")

# Custom CSS for a more polished look
st.markdown("""
<style>
    .main {
        background-color: #fdfcfb;
    }
    .stMetric {
        background-color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        border: 1px solid #f0f0f0;
    }
    .leader-board {
        margin-bottom: 30px;
    }
</style>
""", unsafe_allow_html=True)

st.title("🏆 Super Chore Tracker")
st.write("Welcome Jernick and Bave! Log your chores to earn points.")

# Load current data
chore_logs = load_data()

# --- SIDEBAR: LOG NEW CHORE ---
st.sidebar.header("📝 Log a Chore")
with st.sidebar.form("chore_form", clear_on_submit=True):
    selected_user = st.selectbox("Who completed it?", USERS)
    selected_date = st.date_input("Date", datetime.now())
    selected_chore = st.selectbox("Chore", list(CHORE_VALUES.keys()))
    
    st.divider()
    st.subheader("Parental Approval")
    verification_pwd = st.text_input("Parent Password", type="password")
    
    submit_button = st.form_submit_button("Verify & Submit")

if submit_button:
    if verification_pwd == PARENT_PASSWORD:
        new_entry = {
            "user": selected_user,
            "date": str(selected_date),
            "chore": selected_chore,
            "points": CHORE_VALUES[selected_chore],
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        chore_logs.append(new_entry)
        save_data(chore_logs)
        st.sidebar.success(f"Verified! {CHORE_VALUES[selected_chore]} pts added to {selected_user}.")
# --- SIDEBAR: RESET ---
st.sidebar.markdown("---")
with st.sidebar.expander("🛠️ Admin Actions"):
    reset_pwd = st.text_input("Reset Password", type="password", key="reset_pwd")
    if st.button("Reset All Data"):
        if reset_pwd == "0987":
            save_data([])
            st.success("All data has been reset!")
            st.rerun()
        else:
            st.error("Incorrect Reset Password.")

# --- CALCULATION ---
scores = {user: 0 for user in USERS}
for log in chore_logs:
    scores[log['user']] += log['points']

# --- LEADERBOARD ---
st.header("📊 Leaderboard")
col1, col2 = st.columns(2)
with col1:
    st.metric("Jernick's Total", f"{scores['Jernick']} pts")
with col2:
    st.metric("Bave's Total", f"{scores['Bave']} pts")

# Winner Logic
if scores["Jernick"] > 0 or scores["Bave"] > 0:
    if scores["Jernick"] > scores["Bave"]:
        st.balloons()
        st.success("🔥 Jernick is in the lead!")
    elif scores["Bave"] > scores["Jernick"]:
        st.balloons()
        st.success("🔥 Bave is in the lead!")
    else:
        st.info("🤝 It's currently a tie!")

# --- HISTORY ---
with st.expander("Show Activity History"):
    if chore_logs:
        df = pd.DataFrame(chore_logs)
        st.dataframe(df[['date', 'user', 'chore', 'points']].sort_values('date', ascending=False), use_container_width=True)
    else:
        st.write("No chores logged yet.")
