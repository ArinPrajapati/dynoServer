import {
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuid } from "uuid";
import { db } from "../config/dynamodb.js";

const createUser = async (req, res) => {
  try {
    const { name, email, password, task } = req.body;

    console.log(req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const checkUserByEmail = await db.send(
      new ScanCommand({
        TableName: "User",
        FilterExpression: "#email = :email",
        ExpressionAttributeNames: { "#email": "email" },
        ExpressionAttributeValues: { ":email": { S: email } },
      })
    );

    if (checkUserByEmail.Items.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const params = {
      TableName: "User",
      Item: marshall({
        id: uuid(),
        name,
        email,
        password,
        task,
      }),
    };

    console.log(params);

    const data = await db.send(new PutItemCommand(params));

    if (!data) {
      return res.status(500).json({ error: "Error while creating user" });
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error occurred:", error);
    return res
      .status(500)
      .json({ error: error.message || "Unknown error occurred" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const userData = await db.send(
      new ScanCommand({
        TableName: "User",
        FilterExpression: "#email = :email",
        ExpressionAttributeNames: { "#email": "email" },
        ExpressionAttributeValues: { ":email": { S: email } },
      })
    );

    if (userData.Items.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(userData);
    const user = unmarshall(userData.Items[0]);

    const passwordMatch = password === user.password;

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Missing email, old password, or new password" });
    }

    const userData = await db.send(
      new ScanCommand({
        TableName: "User",
        FilterExpression: "#email = :email AND #password = :password",
        ExpressionAttributeNames: {
          "#email": "email",
          "#password": "password",
        },
        ExpressionAttributeValues: {
          ":email": { S: email },
          ":password": { S: oldPassword },
        },
      })
    );

    if (userData.Items.length === 0) {
      return res
        .status(404)
        .json({ error: "User not found or invalid old password" });
    }

    console.log(userData);
    const user = unmarshall(userData.Items[0]);
    console.log(user);
    const userId = user.id;

    // Update user's password
    const updateUserParams = {
      TableName: "User",
      Key: { id: { S: userId }, email: { S: email } }, // need to send both pk and sk
      UpdateExpression: "SET #password = :newPassword",
      ExpressionAttributeNames: { "#password": "password" },
      ExpressionAttributeValues: { ":newPassword": { S: newPassword } },
    };

    const updateResult = await db.send(new UpdateItemCommand(updateUserParams));

    if (!updateResult) {
      return res
        .status(500)
        .json({ error: "Error while updating user password" });
    }

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getUserByTask = async (req, res) => {
  try {
    const task = req.params.task;
    console.log(task);
    if (!task) {
      return res.status(400).json({ error: "Missing task" });
    }
    const userData = await db.send(
      new ScanCommand({
        TableName: "User",
        FilterExpression: "#task = :task",
        ExpressionAttributeNames: { "#task": "task" },
        ExpressionAttributeValues: { ":task": { S: task } },
      })
    );
    console.log(userData, "userData");
    if (userData.Items.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const users = userData.Items.map((item) => unmarshall(item)); // Unmarshall each item in the array
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const userData = await db.send(
      new ScanCommand({
        TableName: "User",
        FilterExpression: "#id = :id",
        ExpressionAttributeNames: { "#id": "id" },
        ExpressionAttributeValues: { ":id": { S: id } },
      })
    );

    const deleteResult = await db.send(
      new DeleteItemCommand({
        TableName: "User",
        Key: { id: { S: id }, email: { S: userData.Items[0].email.S } },
      })
    );

    if (!deleteResult) {
      return res.status(500).json({ error: "Error while deleting user" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { createUser, login, updateUserPassword, getUserByTask, deleteUser };
