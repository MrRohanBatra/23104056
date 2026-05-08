import express from "express";
import axios from "axios";
// import { config } from "dotenv";
import AUTH_TOKEN from "../userData.js";
import { Log } from "../logging_middleware/log.js";
import userData from "../userData.js";
const depotUrl = "http://4.224.186.213/evaluation-service/depots";
const vehicleUrl = "http://4.224.186.213/evaluation-service/vehicles";
const app = express();
let token=null;
async function fetchToken() {
  try {
    const response = await axios.post(
    "http://4.224.186.213/evaluation-service/auth",
    {
        ...userData
    },
  );
  token=response.data.access_token;
  console.log("token fetched");
  } catch (error) {
    console.log(error);
    console.log("token fetch failed");  
  }
}
app.use(express.json());

app.get("/schedule/:id", async (req, res) => {
  try {
    const id=req.params.id;
    Log("backend","debug","controller",`request id:${id} `,token)
    Log("backend", "info", "controller", "fetching depots", token);
    Log("backend", "info", "controller", "fetching vehicles", token);
    const [depotResponse, vehiclesResponse] = await Promise.all([
      axios.get(depotUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      axios.get(vehicleUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);
    const depots = depotResponse.data.depots;
    const vehicles = vehiclesResponse.data.vehicles;
    const depot = depots.find((el) => el.ID == id);
    if(!depot){
        Log("backend","fatal","controller","depot not found,invalid input id",token);
        return res.status(404).json({
            message:"depot not found,invalid input id",
        })
    }
    const result=logic(depot.MechanicHours,vehicles);
    return res.status(200).json({
      depotID:id,
      hours:depot.hours,
      ...result
    });
  } catch (error) {
    Log("backend", "error", "controller", "failed to fetch vehicles/depots");
    return res.status(500).json({
        message:"Internal Server Error",
    })
  }
});

app.listen(3000, async() => {
    await fetchToken();
    Log(
    "backend",
    "debug",
    "config",
    "vehicle service listening on port 3000",
    token,
  );
  console.log("listenging on 3000");
});

async function getDepots() {
  try {
    const response = await axios.get(depotUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
  } catch (error) {
    console.log(error.response);
  }
}
// console.log(token);
// getDepots();

function logic(budgetHours, vehicles) {
  const n = vehicles.length;
  const dp = Array(n + 1)
    .fill(null)
    .map(() => Array(budgetHours + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const vehicle = vehicles[i - 1];
    const time = parseInt(
      vehicle.Duration,
    );
    const score = parseInt(
      vehicle.Impact,
    );

    for (let w = 0; w <= budgetHours; w++) {
      if (time <= w) {
        dp[i][w] = Math.max(score + dp[i - 1][w - time], dp[i - 1][w]);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  let maxScore = dp[n][budgetHours];
  let currentScore = maxScore;
  let w = budgetHours;
  const selectedTaskIDs = [];

  for (let i = n; i > 0 && currentScore > 0; i--) {
    if (currentScore !== dp[i - 1][w]) {
      const vehicle = vehicles[i - 1];
      selectedTaskIDs.push(vehicle.TaskID);

      const time = parseInt(
        vehicle.duration || vehicle.timeTaken || vehicle.time || 0,
      );
      const score = parseInt(
        vehicle.score || vehicle.impactScore || vehicle.importance || 0,
      );

      currentScore -= score;
      w -= time;
    }
  }

  return {
    highestPossibleScore: maxScore,
    selectedTaskIDs: selectedTaskIDs,
  };
}
