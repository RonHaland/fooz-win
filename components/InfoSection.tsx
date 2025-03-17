"use client";

export function InfoSection() {
  return (
    <div className="mt-12 pt-8 border-t border-slate-700/50">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
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
              Click on any score in a game card to update it.
            </p>
            <p>
              <span className="font-medium text-emerald-400">
                Enable/Disable Players:
              </span>{" "}
              Toggle the switch next to a player&apos;s name to include/exclude
              them from games.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Data Storage
          </h3>
          <p className="text-sm text-slate-300">
            All tournament data is stored locally in your browser using
            localStorage. This means:
          </p>
          <ul className="mt-2 text-sm text-slate-300 list-disc list-inside space-y-1">
            <li>Your data persists between sessions</li>
            <li>Data is private and only accessible on your device</li>
            <li>Clearing browser data will remove your tournaments</li>
            <li>Data is not synced between devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
