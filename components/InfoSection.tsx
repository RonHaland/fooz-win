"use client";

export function InfoSection() {
  return (
    <div className="mt-12 pt-8 border-t border-slate-700/50">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">How to Use</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              <span className="font-medium text-emerald-400">
                Create Tournament:
              </span>{" "}
              Click the &quot;New Tournament&quot; button and enter a name.
            </p>
            <p>
              <span className="font-medium text-emerald-400">Add Players:</span>{" "}
              Go to the Administration tab and add players using the input
              field.
            </p>
            <p>
              <span className="font-medium text-emerald-400">
                Manage Games:
              </span>{" "}
              Use the &quot;Add Game&quot; button to create new games. Players
              are automatically selected based on who has played the least.
            </p>
            <p>
              <span className="font-medium text-emerald-400">
                Update Scores:
              </span>{" "}
              Click on{" "}
              <span className="rounded px-1 bg-white/10 border border-white/20">
                +
              </span>{" "}
              or{" "}
              <span className="rounded px-1 bg-white/10 border border-white/20">
                -
              </span>{" "}
              on a game card to update the score for a game.
            </p>
            <p>
              <span className="font-medium text-emerald-400">
                Enable/Disable Players:
              </span>{" "}
              Toggle the switch next to a player&apos;s name to include/exclude
              them from games.
            </p>
            <p>
              <span className="font-medium text-emerald-400">
                Publish Tournament:
              </span>{" "}
              Click &quot;Publish Tournament&quot; in the admin panel to save
              your tournament online. You can make it public or private, and
              manage access for other users.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            Data Storage
          </h2>
          <p className="text-sm text-slate-300 mb-4">
            Tournament data can be stored in two ways:
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-emerald-400 mb-2">
                Local Storage
              </h3>
              <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
                <li>Data persists between sessions</li>
                <li>Only accessible on your device</li>
                <li>Clearing browser data will remove tournaments</li>
                <li>No sharing capabilities</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-emerald-400 mb-2">
                Published Tournaments
              </h3>
              <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
                <li>Stored securely in the cloud</li>
                <li>Accessible from any device</li>
                <li>Can be shared with other users</li>
                <li>Set visibility to public or private</li>
                <li>Manage access permissions for other users</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
